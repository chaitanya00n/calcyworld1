/* Calcyworld - live currency + crypto rates for the static (Vercel) version.
   Same data and checks as the WordPress plugin's cw_refresh_rates(), plus a second free source in case the first
   one is busy. Vercel's CDN keeps the answer for 6 hours, so the free services are called only a few times a day
   no matter how many people visit. If nothing works, the pages keep the rates they were built with. */
'use strict';

const PRIMARY_URL = process.env.CW_RATES_URL || 'https://open.er-api.com/v6/latest/USD';
const BACKUP_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
const CRYPTO_URL = 'https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,usd-coin,cardano,dogecoin,tron,polkadot,litecoin,chainlink,avalanche-2,shiba-inu';
const SITE_CURRENCIES = new Set(["AED", "AFN", "ALL", "AMD", "AOA", "ARS", "AUD", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "GBP", "GEL", "GHS", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SLE", "SOS", "SRD", "SSP", "STN", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XOF", "YER", "ZAR", "ZMW", "ZWG"]);

let lastGood = null; // survives while this server instance stays warm

async function getJson(url, ms) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

function accept(map) {
  const out = {};
  for (const code of Object.keys(map || {})) {
    const v = Number(map[code]);
    if (/^[A-Z]{3}$/.test(code) && Number.isFinite(v) && v > 0) out[code] = v;
  }
  out.USD = 1;
  return Object.keys(out).length > 20 ? out : null;
}

async function fromPrimary() {
  const d = await getJson(PRIMARY_URL, 8000);
  const rates = accept(d && d.rates);
  if (!rates) throw new Error('primary: too few rates');
  return { base: d.base_code || d.base || 'USD', rates, time: Number(d.time_last_update_unix || d.timestamp) || Math.floor(Date.now() / 1000) };
}

async function fromBackup() {
  const d = await getJson(BACKUP_URL, 8000);
  const src = (d && d.usd) || {};
  const up = {};
  for (const k of Object.keys(src)) {
    const code = k.toUpperCase();
    if (SITE_CURRENCIES.has(code)) up[code] = src[k]; // the backup list also holds crypto tickers: keep real currencies only
  }
  const rates = accept(up);
  if (!rates) throw new Error('backup: too few rates');
  const t = Date.parse(d.date);
  return { base: 'USD', rates, time: Number.isFinite(t) ? Math.floor(t / 1000) : Math.floor(Date.now() / 1000) };
}

module.exports = async function handler(req, res) {
  let got = null;
  for (const source of [fromPrimary, fromBackup]) {
    try {
      got = await source();
      break;
    } catch (e) {
      got = null;
    }
  }

  let crypto = {};
  try {
    const c = await getJson(CRYPTO_URL, 8000);
    if (c && c.bitcoin && c.bitcoin.usd) crypto = c;
  } catch (e) {
    crypto = {};
  }

  if (got) {
    lastGood = { ...got, crypto: Object.keys(crypto).length ? crypto : (lastGood ? lastGood.crypto : {}) };
  }
  if (!lastGood) {
    // nothing usable: do not cache the failure, the page keeps the rates it was built with
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'rates unavailable' });
    return;
  }
  res.setHeader('Cache-Control', got ? 'public, max-age=1800, s-maxage=21600, stale-while-revalidate=86400' : 'public, max-age=300, s-maxage=900');
  res.status(200).json({ base: lastGood.base, rates: lastGood.rates, time: lastGood.time, fetched: Math.floor(Date.now() / 1000), crypto: lastGood.crypto });
};
