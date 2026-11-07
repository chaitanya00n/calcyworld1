/* Calcyworld — tech: cryptography, encoding & ciphers */
(function (CW) {
  'use strict';
  var C = CW.C, M = CW.M, Rr = CW.Rr, esc = CW.esc;
  var CG = 'tech/cryptography';
  var T = function (l, v) { return Rr(l, v, 'text'); }, MT = function (l, v) { return M(l, v, 'text'); };
  var Nm = function (l, v, dp, u) { return Rr(l, v, 'num', { dp: dp === undefined ? 0 : dp, u: u || '' }); };
  var pre = function (s) { return '<pre class="cw-pre">' + esc(s) + '</pre>'; };
  var utf8 = function (s) { return new TextEncoder().encode(String(s)); };
  var hexOf = function (a) { var s = ''; for (var i = 0; i < a.length; i++) s += ('0' + (a[i] & 255).toString(16)).slice(-2); return s; };

  /* ---------- hash functions (pure JS, synchronous) ---------- */
  function rol(x, n) { return (x << n) | (x >>> (32 - n)); }
  function hx32(x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }
  var MD5K = null;
  function md5(b) {
    var S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21], i, K = MD5K;
    if (!K) { K = MD5K = []; for (i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0; }
    var n = b.length, nb = ((n + 8) >> 6) + 1, w = []; for (i = 0; i < nb * 16; i++) w[i] = 0;
    for (i = 0; i < n; i++) w[i >> 2] |= b[i] << ((i % 4) * 8);
    w[n >> 2] |= 0x80 << ((n % 4) * 8); w[nb * 16 - 2] = (n * 8) >>> 0; w[nb * 16 - 1] = Math.floor(n * 8 / 4294967296);
    var a0 = 0x67452301, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476;
    for (var o = 0; o < nb * 16; o += 16) {
      var A = a0, B = b0, Cc = c0, D = d0;
      for (i = 0; i < 64; i++) {
        var f, g;
        if (i < 16) { f = (B & Cc) | (~B & D); g = i; } else if (i < 32) { f = (D & B) | (~D & Cc); g = (5 * i + 1) % 16; } else if (i < 48) { f = B ^ Cc ^ D; g = (3 * i + 5) % 16; } else { f = Cc ^ (B | ~D); g = (7 * i) % 16; }
        f = (f + A + K[i] + w[o + g]) | 0; A = D; D = Cc; Cc = B;
        var s = S[(i >> 4) * 4 + (i % 4)]; B = (B + ((f << s) | (f >>> (32 - s)))) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + Cc) | 0; d0 = (d0 + D) | 0;
    }
    var out = ''; [a0, b0, c0, d0].forEach(function (x) { for (var j = 0; j < 4; j++) out += ('0' + ((x >>> (j * 8)) & 255).toString(16)).slice(-2); });
    return out;
  }
  function padBE(b, blk) { // big-endian padding to 32-bit words (blk = 64 bytes)
    var n = b.length, nb = ((n + 8) >> 6) + 1, w = [], i; for (i = 0; i < nb * 16; i++) w[i] = 0;
    for (i = 0; i < n; i++) w[i >> 2] |= b[i] << (24 - (i % 4) * 8);
    w[n >> 2] |= 0x80 << (24 - (n % 4) * 8); w[nb * 16 - 1] = (n * 8) >>> 0; w[nb * 16 - 2] = Math.floor(n * 8 / 4294967296);
    return { w: w, nb: nb };
  }
  function sha1(b) {
    var p = padBE(b), w = p.w, h0 = 0x67452301, h1 = 0xefcdab89 | 0, h2 = 0x98badcfe | 0, h3 = 0x10325476, h4 = 0xc3d2e1f0 | 0;
    for (var o = 0; o < p.nb * 16; o += 16) {
      var W = [], t; for (t = 0; t < 80; t++) W[t] = t < 16 ? w[o + t] : rol(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
      var a = h0, bb = h1, c = h2, d = h3, e = h4;
      for (t = 0; t < 80; t++) {
        var f, k; if (t < 20) { f = (bb & c) | (~bb & d); k = 0x5a827999; } else if (t < 40) { f = bb ^ c ^ d; k = 0x6ed9eba1; } else if (t < 60) { f = (bb & c) | (bb & d) | (c & d); k = 0x8f1bbcdc | 0; } else { f = bb ^ c ^ d; k = 0xca62c1d6 | 0; }
        var tmp = (rol(a, 5) + f + e + k + W[t]) | 0; e = d; d = c; c = rol(bb, 30); bb = a; a = tmp;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + bb) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    return [h0, h1, h2, h3, h4].map(hx32).join('');
  }
  var PR = null, K256 = null, H256 = null;
  function primes(n) { var p = [], x = 2; while (p.length < n) { var ok = true; for (var i = 0; i < p.length; i++) if (x % p[i] === 0) { ok = false; break; } if (ok) p.push(x); x++; } return p; }
  function sha256(b) {
    if (!K256) { PR = primes(64); K256 = PR.map(function (p) { return Math.floor((Math.cbrt(p) % 1) * 4294967296) >>> 0; }); H256 = PR.slice(0, 8).map(function (p) { return Math.floor((Math.sqrt(p) % 1) * 4294967296) >>> 0; }); }
    var p = padBE(b), w = p.w, H = H256.slice();
    for (var o = 0; o < p.nb * 16; o += 16) {
      var W = [], t; for (t = 0; t < 64; t++) {
        if (t < 16) W[t] = w[o + t]; else {
          var x = W[t - 15], y = W[t - 2];
          var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3), s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
          W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
        }
      }
      var a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7)), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K256[t] + W[t]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10)), mj = (a & bb) ^ (a & c) ^ (bb & c), t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + bb) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(hx32).join('');
  }
  var K512 = null, H512 = null, H384 = null;
  function iroot(n, k) { // floor of k-th root of BigInt n
    var x = BigInt(1) << BigInt(Math.ceil(n.toString(2).length / k) + 1), kk = BigInt(k);
    for (;;) { var y = ((kk - BigInt(1)) * x + n / (x ** (kk - BigInt(1)))) / kk; if (y >= x) return x; x = y; }
  }
  function sha512(b, is384) {
    var M64 = (BigInt(1) << BigInt(64)) - BigInt(1);
    if (!K512) {
      var pr = primes(80); K512 = pr.map(function (p) { return iroot(BigInt(p) << BigInt(192), 3) & M64; });
      H512 = pr.slice(0, 8).map(function (p) { return iroot(BigInt(p) << BigInt(128), 2) & M64; });
      H384 = pr.slice(8, 16).map(function (p) { return iroot(BigInt(p) << BigInt(128), 2) & M64; });
    }
    var n = b.length, total = ((n + 17 + 127) >> 7) << 7, buf = new Uint8Array(total); buf.set(b); buf[n] = 0x80;
    var bits = BigInt(n) * BigInt(8); for (var i = 0; i < 16; i++) buf[total - 1 - i] = Number((bits >> BigInt(8 * i)) & BigInt(255));
    var H = (is384 ? H384 : H512).slice(), R = function (x, k) { return ((x >> BigInt(k)) | (x << BigInt(64 - k))) & M64; };
    for (var o = 0; o < total; o += 128) {
      var W = [], t; for (t = 0; t < 16; t++) { var v = BigInt(0); for (var j = 0; j < 8; j++) v = (v << BigInt(8)) | BigInt(buf[o + t * 8 + j]); W[t] = v; }
      for (t = 16; t < 80; t++) { var s0 = R(W[t - 15], 1) ^ R(W[t - 15], 8) ^ (W[t - 15] >> BigInt(7)), s1 = R(W[t - 2], 19) ^ R(W[t - 2], 61) ^ (W[t - 2] >> BigInt(6)); W[t] = (W[t - 16] + s0 + W[t - 7] + s1) & M64; }
      var a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 80; t++) {
        var S1 = R(e, 14) ^ R(e, 18) ^ R(e, 41), ch = (e & f) ^ ((~e & M64) & g), t1 = (h + S1 + ch + K512[t] + W[t]) & M64;
        var S0 = R(a, 28) ^ R(a, 34) ^ R(a, 39), mj = (a & bb) ^ (a & c) ^ (bb & c), t2 = (S0 + mj) & M64;
        h = g; g = f; f = e; e = (d + t1) & M64; d = c; c = bb; bb = a; a = (t1 + t2) & M64;
      }
      var nh = [a, bb, c, d, e, f, g, h]; for (t = 0; t < 8; t++) H[t] = (H[t] + nh[t]) & M64;
    }
    var out = H.map(function (x) { return ('0000000000000000' + x.toString(16)).slice(-16); }).join('');
    return is384 ? out.slice(0, 96) : out;
  }
  var CRCT = null;
  function crc32(b) { if (!CRCT) { CRCT = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRCT[n] = c >>> 0; } } var c2 = 0xffffffff; for (var i = 0; i < b.length; i++) c2 = CRCT[(c2 ^ b[i]) & 255] ^ (c2 >>> 8); return ((c2 ^ 0xffffffff) >>> 0); }
  function adler32(b) { var a = 1, c = 0; for (var i = 0; i < b.length; i++) { a = (a + b[i]) % 65521; c = (c + a) % 65521; } return ((c << 16) | a) >>> 0; }
  CW.hash = { md5: function (s) { return md5(utf8(s)); }, sha1: function (s) { return sha1(utf8(s)); }, sha256: function (s) { return sha256(utf8(s)); }, sha384: function (s) { return sha512(utf8(s), true); }, sha512: function (s) { return sha512(utf8(s)); }, crc32: function (s) { return crc32(utf8(s)); } };

  var HASHES = [['MD5', md5], ['SHA-1', sha1], ['SHA-256', sha256], ['SHA-384', function (b) { return sha512(b, true); }], ['SHA-512', function (b) { return sha512(b); }]];
  var applyCase = function (s, c) { return c === 2 ? s.toUpperCase() : s; };
  C('hash-generator-calculator', 'Hash Generator (MD5, SHA-1, SHA-256, SHA-512)', CG, 'Hash any text with MD5, SHA-1, SHA-256, SHA-384 and SHA-512 — all in your browser.', 'Digest = H(UTF-8 bytes of the text). Nothing is sent anywhere.',
    [['t', 'Text', 'ta', 'Calcyworld'], ['c', 'Hex case', 'g', 1, [[1, 'lower'], [2, 'UPPER']]]],
    function (v) { var b = utf8(v.t), res = [], rows = []; HASHES.forEach(function (h, i) { var d = applyCase(h[1](b), +v.c); res.push(i === 2 ? MT(h[0], d) : T(h[0], d)); rows.push(h[0] + '  ' + d); }); res.push(T('CRC-32', applyCase(('00000000' + crc32(b).toString(16)).slice(-8), +v.c))); return { results: res, html: pre(rows.join('\n')) }; }, { pop: 1 });
  [['md5-hash-generator', 'MD5 Hash Generator', 0, 'MD5 is fine for checksums, not for passwords or signatures.'], ['sha1-hash-generator', 'SHA-1 Hash Generator', 1, 'SHA-1 is deprecated for security use; prefer SHA-256.'], ['sha256-hash-generator', 'SHA-256 Hash Generator', 2, 'SHA-256 is the standard for checksums, certificates and blockchains.'], ['sha512-hash-generator', 'SHA-512 Hash Generator', 4, 'SHA-512 gives a 512-bit (128 hex character) digest.']].forEach(function (x) {
    C(x[0], x[1], CG, x[1] + ' — instant digest of any text, computed in your browser.', x[3], [['t', 'Text', 'ta', 'hello world'], ['c', 'Hex case', 'g', 1, [[1, 'lower'], [2, 'UPPER']]]],
      function (v) { var d = applyCase(HASHES[x[2]][1](utf8(v.t)), +v.c); return { results: [MT(HASHES[x[2]][0], d), Nm('Length (hex characters)', d.length), Nm('Length (bits)', d.length * 4)], html: pre(d) }; });
  });
  C('crc32-checksum-calculator', 'CRC32 & Adler-32 Checksum Calculator', CG, 'Checksums of text, used in ZIP, PNG and network protocols.', 'CRC-32 (IEEE 802.3) and Adler-32.',
    [['t', 'Text', 'ta', '123456789']],
    function (v) { var b = utf8(v.t), c = crc32(b), a = adler32(b); return { results: [MT('CRC-32 (hex)', ('00000000' + c.toString(16)).slice(-8)), Nm('CRC-32 (decimal)', c), T('Adler-32 (hex)', ('00000000' + a.toString(16)).slice(-8)), Nm('Bytes', b.length)] }; });

  /* ---------- Base64 ---------- */
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function b64enc(b, url) { var s = '', i; for (i = 0; i < b.length; i += 3) { var n = (b[i] << 16) | ((b[i + 1] || 0) << 8) | (b[i + 2] || 0); s += B64[n >> 18 & 63] + B64[n >> 12 & 63] + (i + 1 < b.length ? B64[n >> 6 & 63] : '=') + (i + 2 < b.length ? B64[n & 63] : '='); } if (url) s = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); return s; }
  function b64dec(s) { s = String(s).replace(/-/g, '+').replace(/_/g, '/').replace(/[\s=]+/g, ''); if (/[^A-Za-z0-9+/]/.test(s)) throw new Error('bad'); var out = [], buf = 0, bits = 0; for (var i = 0; i < s.length; i++) { buf = (buf << 6) | B64.indexOf(s[i]); bits += 6; if (bits >= 8) { bits -= 8; out.push((buf >> bits) & 255); buf &= (1 << bits) - 1; } } return new Uint8Array(out); }
  CW.b64 = { enc: b64enc, dec: b64dec };
  C('base64-encode-decode-calculator', 'Base64 Encode & Decode', CG, 'Encode text to Base64 or decode Base64 back to text (UTF-8 safe).', 'Base64 maps every 3 bytes to 4 characters from A–Z a–z 0–9 + /.',
    [['m', 'Action', 'g', 1, [[1, 'Encode'], [2, 'Decode']]], ['t', 'Input', 'ta', 'Hello, Calcyworld!'], ['u', 'URL-safe alphabet', 'c', 0]],
    function (v) { var out; try { out = +v.m === 1 ? b64enc(utf8(v.t), v.u) : new TextDecoder('utf-8', { fatal: true }).decode(b64dec(v.t)); } catch (e) { return { error: 'That is not valid Base64 text.' }; } return { results: [MT(+v.m === 1 ? 'Base64' : 'Decoded text', out), Nm('Input length', v.t.length), Nm('Output length', out.length)], html: pre(out) }; }, { pop: 1 });
  C('base64-to-hex-converter', 'Base64 ↔ Hex Converter', CG, 'Convert Base64 data to hexadecimal bytes and back.', 'Bytes are re-encoded between the two alphabets.',
    [['m', 'Convert', 'g', 1, [[1, 'Base64 → Hex'], [2, 'Hex → Base64']]], ['t', 'Input', 'ta', 'SGVsbG8h']],
    function (v) { try { if (+v.m === 1) { var b = b64dec(v.t); return { results: [MT('Hex', hexOf(b)), Nm('Bytes', b.length)] }; } var h = String(v.t).replace(/[^0-9a-fA-F]/g, ''); if (h.length % 2) return { error: 'Hex must have an even number of digits.' }; var a = []; for (var i = 0; i < h.length; i += 2) a.push(parseInt(h.substr(i, 2), 16)); return { results: [MT('Base64', b64enc(a)), Nm('Bytes', a.length)] }; } catch (e) { return { error: 'Invalid input.' }; } });
  C('url-encode-decode-calculator', 'URL Encode & Decode', CG, 'Percent-encode or decode URLs and query parameters.', 'Reserved characters become %XX (UTF-8).',
    [['m', 'Action', 'g', 1, [[1, 'Encode'], [2, 'Decode']]], ['k', 'Scope', 'g', 1, [[1, 'Component (every symbol)'], [2, 'Whole URL']]], ['t', 'Input', 'ta', 'https://example.com/search?q=emi calculator & loans']],
    function (v) { var o; try { o = +v.m === 1 ? (+v.k === 1 ? encodeURIComponent(v.t) : encodeURI(v.t)) : (+v.k === 1 ? decodeURIComponent(v.t) : decodeURI(v.t)); } catch (e) { return { error: 'Malformed % sequence.' }; } return { results: [MT('Result', o), Nm('Characters', o.length)], html: pre(o) }; }, { pop: 1 });
  var ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  C('html-entities-encode-decode-calculator', 'HTML Entities Encode & Decode', CG, 'Escape or unescape HTML special characters.', '& < > " \' become entities.',
    [['m', 'Action', 'g', 1, [[1, 'Encode'], [2, 'Decode']]], ['n', 'Encode non-ASCII as &#NNN;', 'c', 0], ['t', 'Input', 'ta', '<a href="/tools">Tom & Jerry\'s</a>']],
    function (v) { var o; if (+v.m === 1) { o = v.t.replace(/[&<>"']/g, function (c) { return ENT[c]; }); if (v.n) o = o.replace(/[^\x00-\x7f]/g, function (c) { return '&#' + c.codePointAt(0) + ';'; }); } else { o = v.t.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, function (m, e) { e = e.toLowerCase(); if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)); return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[e]; }); } return { results: [MT('Result', o)], html: pre(o) }; });
  C('jwt-decoder-calculator', 'JWT Decoder', CG, 'Read the header and payload of a JSON Web Token (no signature check).', 'Header and payload are Base64url-encoded JSON.',
    [['t', 'JWT', 'ta', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.signature']],
    function (v) { var p = String(v.t).trim().split('.'); if (p.length < 2) return { error: 'A JWT has three dot-separated parts.' }; var h, d; try { h = JSON.parse(new TextDecoder().decode(b64dec(p[0]))); d = JSON.parse(new TextDecoder().decode(b64dec(p[1]))); } catch (e) { return { error: 'Could not decode — check the token.' }; }
      var res = [MT('Algorithm', h.alg || '—'), T('Type', h.typ || '—')]; if (d.iat) res.push(T('Issued at', new Date(d.iat * 1000).toLocaleString())); if (d.exp) { res.push(T('Expires', new Date(d.exp * 1000).toLocaleString())); res.push(T('Status', d.exp * 1000 < Date.now() ? 'Expired' : 'Valid (not expired)')); }
      return { results: res, html: pre('HEADER\n' + JSON.stringify(h, null, 2) + '\n\nPAYLOAD\n' + JSON.stringify(d, null, 2)), note: 'Decoding does not verify the signature. Do not paste production secrets into online tools; this page runs only in your browser.' }; });

  /* ---------- text <-> binary / hex / ASCII ---------- */
  C('text-to-binary-converter', 'Text to Binary, Hex & ASCII Converter', CG, 'Convert text to binary, hexadecimal, decimal, octal and back.', 'Each UTF-8 byte is shown in the chosen base.',
    [['m', 'Direction', 'g', 1, [[1, 'Text → code'], [2, 'Code → text']]], ['b', 'Base', 's', 2, [[2, 'Binary'], [16, 'Hexadecimal'], [10, 'Decimal'], [8, 'Octal']]], ['t', 'Input', 'ta', 'Hello']],
    function (v) { var bs = +v.b, pad = { 2: 8, 16: 2, 10: 0, 8: 3 }[bs]; if (+v.m === 1) { var b = utf8(v.t), o = Array.prototype.map.call(b, function (x) { var s = x.toString(bs); while (s.length < pad) s = '0' + s; return bs === 16 ? s.toUpperCase() : s; }).join(' '); return { results: [MT({ 2: 'Binary', 16: 'Hexadecimal', 10: 'Decimal', 8: 'Octal' }[bs], o), Nm('Bytes', b.length)], html: pre(o) }; } var parts = String(v.t).trim().split(/[\s,]+/).filter(Boolean); if (!parts.length) return { error: 'Enter some codes.' }; var arr = parts.map(function (p) { return parseInt(p.replace(/^0[xob]/i, ''), bs); }); if (arr.some(function (x) { return isNaN(x) || x < 0 || x > 255; })) return { error: 'Each code must be a valid byte (0–255) in the chosen base.' }; var txt; try { txt = new TextDecoder().decode(new Uint8Array(arr)); } catch (e) { return { error: 'Invalid bytes.' }; } return { results: [MT('Text', txt), Nm('Bytes', arr.length)] }; }, { pop: 1 });
  C('binary-to-text-converter', 'Binary to Text Translator', CG, 'Decode binary 0s and 1s into readable text.', 'Groups of 8 bits are read as UTF-8 bytes.',
    [['t', 'Binary', 'ta', '01001000 01100101 01101100 01101100 01101111']],
    function (v) { var s = String(v.t).replace(/[^01]/g, ''); if (s.length < 8 || s.length % 8) return { error: 'Binary length must be a multiple of 8 bits.' }; var a = []; for (var i = 0; i < s.length; i += 8) a.push(parseInt(s.substr(i, 8), 2)); var txt; try { txt = new TextDecoder().decode(new Uint8Array(a)); } catch (e) { return { error: 'Invalid bytes.' }; } return { results: [MT('Text', txt), Nm('Bytes', a.length)] }; });
  C('ascii-table-lookup-calculator', 'ASCII & Unicode Character Lookup', CG, 'Look up a character code or a code point.', 'ASCII covers 0–127; Unicode goes up to 10FFFF.',
    [['m', 'Find', 'g', 1, [[1, 'Code of a character'], [2, 'Character of a code']]], ['c', 'Character', 't', 'A', '', { show: 'm==1' }], ['n', 'Code (decimal)', 'n', 65, '', { show: 'm==2' }]],
    function (v) { var cp; if (+v.m === 1) { if (!v.c) return { error: 'Type a character.' }; cp = String(v.c).codePointAt(0); } else cp = Math.round(v.n); if (cp < 0 || cp > 0x10ffff) return { error: 'Code must be 0–1114111.' }; var ch = String.fromCodePoint(cp); return { results: [MT('Character', cp < 32 ? '(control)' : ch), Nm('Decimal', cp), T('Hex', 'U+' + cp.toString(16).toUpperCase()), T('Binary', cp.toString(2)), T('Octal', cp.toString(8)), T('HTML entity', '&#' + cp + ';'), T('UTF-8 bytes', hexOf(utf8(ch)).replace(/(..)/g, '$1 ').trim())] }; });

  /* ---------- classic ciphers ---------- */
  var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function shiftText(s, k) { return s.replace(/[a-z]/gi, function (c) { var u = c === c.toUpperCase(), i = (A.indexOf(c.toUpperCase()) + k) % 26; if (i < 0) i += 26; return u ? A[i] : A[i].toLowerCase(); }); }
  C('caesar-cipher-calculator', 'Caesar Cipher Encoder & Decoder', CG, 'Shift letters by a fixed number of places; try every shift to crack a message.', 'E(x) = (x + k) mod 26.',
    [['m', 'Action', 'g', 1, [[1, 'Encrypt'], [2, 'Decrypt'], [3, 'Try all 25 shifts']]], ['k', 'Shift', 'i', 3, '', { show: 'if(m==3,0,1)' }], ['t', 'Text', 'ta', 'Meet me at the library at noon']],
    function (v) { var m = +v.m; if (m === 3) { var rows = []; for (var k = 1; k < 26; k++) rows.push([k, shiftText(v.t, -k)]); return { results: [MT('Shift 3 (classic)', shiftText(v.t, -3))], table: { head: ['Shift', 'Decrypted text'], rows: rows, fmt: ['int', ''], title: 'All shifts' } }; } var o = shiftText(v.t, m === 1 ? v.k : -v.k); return { results: [MT(m === 1 ? 'Encrypted' : 'Decrypted', o)], html: pre(o) }; }, { pop: 1 });
  C('rot13-calculator', 'ROT13 / ROT47 Encoder', CG, 'Self-inverse letter rotation — apply twice to restore.', 'ROT13 = Caesar shift of 13.',
    [['t', 'Text', 'ta', 'Why did the chicken cross the road?'], ['m', 'Variant', 'g', 13, [[13, 'ROT13 (letters)'], [47, 'ROT47 (printable ASCII)']]]],
    function (v) { var o = +v.m === 13 ? shiftText(v.t, 13) : v.t.replace(/[!-~]/g, function (c) { return String.fromCharCode(33 + (c.charCodeAt(0) - 33 + 47) % 94); }); return { results: [MT('Result', o)], html: pre(o) }; });
  C('atbash-cipher-calculator', 'Atbash Cipher', CG, 'Mirror the alphabet: A↔Z, B↔Y…', 'E(x) = 25 − x.',
    [['t', 'Text', 'ta', 'Hello World']],
    function (v) { var o = v.t.replace(/[a-z]/gi, function (c) { var u = c === c.toUpperCase(), x = A[25 - A.indexOf(c.toUpperCase())]; return u ? x : x.toLowerCase(); }); return { results: [MT('Result', o)] }; });
  C('vigenere-cipher-calculator', 'Vigenère Cipher', CG, 'Polyalphabetic cipher with a repeating keyword.', 'E = (P + K) mod 26 with K repeating.',
    [['m', 'Action', 'g', 1, [[1, 'Encrypt'], [2, 'Decrypt']]], ['k', 'Keyword', 't', 'LEMON'], ['t', 'Text', 'ta', 'ATTACK AT DAWN']],
    function (v) { var key = String(v.k).toUpperCase().replace(/[^A-Z]/g, ''); if (!key) return { error: 'Enter a keyword with letters.' }; var j = 0, sg = +v.m === 1 ? 1 : -1; var o = v.t.replace(/[a-z]/gi, function (c) { var u = c === c.toUpperCase(), s = A.indexOf(key[j++ % key.length]) * sg, x = (A.indexOf(c.toUpperCase()) + s + 26) % 26; return u ? A[x] : A[x].toLowerCase(); }); return { results: [MT(sg === 1 ? 'Encrypted' : 'Decrypted', o)], html: pre(o) }; });
  C('affine-cipher-calculator', 'Affine Cipher', CG, 'E(x) = (a·x + b) mod 26 — a must be coprime to 26.', 'a ∈ {1,3,5,7,9,11,15,17,19,21,23,25}.',
    [['m', 'Action', 'g', 1, [[1, 'Encrypt'], [2, 'Decrypt']]], ['a', 'a', 's', 5, [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25].map(function (x) { return [x, String(x)]; })], ['b', 'b', 'i', 8], ['t', 'Text', 'ta', 'AFFINE CIPHER']],
    function (v) { var a = +v.a, b = ((Math.round(v.b) % 26) + 26) % 26, inv = 1; for (var q = 1; q < 26; q++) if ((a * q) % 26 === 1) inv = q; var o = v.t.replace(/[a-z]/gi, function (c) { var u = c === c.toUpperCase(), x = A.indexOf(c.toUpperCase()), y = +v.m === 1 ? (a * x + b) % 26 : (inv * (x - b + 26)) % 26; return u ? A[y] : A[y].toLowerCase(); }); return { results: [MT('Result', o), Nm('Inverse of a', inv)] }; });
  C('rail-fence-cipher-calculator', 'Rail Fence Cipher', CG, 'Write text in a zig-zag across rails, then read row by row.', 'Zig-zag transposition.',
    [['m', 'Action', 'g', 1, [[1, 'Encrypt'], [2, 'Decrypt']]], ['r', 'Rails', 'i', 3], ['t', 'Text', 'ta', 'WEAREDISCOVEREDFLEEATONCE']],
    function (v) { var R = Math.max(2, Math.min(20, Math.round(v.r))), s = String(v.t).replace(/\s+/g, ''), n = s.length; if (n < 2) return { error: 'Enter some text.' }; var pat = [], r = 0, d = 1; for (var i = 0; i < n; i++) { pat.push(r); if (r === 0) d = 1; else if (r === R - 1) d = -1; r += d; } var order = pat.map(function (p, i) { return [p, i]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).map(function (x) { return x[1]; }), o; if (+v.m === 1) o = order.map(function (i) { return s[i]; }).join(''); else { var arr = []; order.forEach(function (idx, k) { arr[idx] = s[k]; }); o = arr.join(''); } return { results: [MT('Result', o)] }; });
  C('a1z26-cipher-calculator', 'A1Z26 Letter-Number Cipher', CG, 'Letters to numbers (A=1 … Z=26) and back.', 'A=1, B=2, … Z=26.',
    [['m', 'Direction', 'g', 1, [[1, 'Letters → numbers'], [2, 'Numbers → letters']]], ['t', 'Input', 'ta', 'HELLO']],
    function (v) { var o; if (+v.m === 1) o = String(v.t).toUpperCase().split('').map(function (c) { return A.indexOf(c) > -1 ? A.indexOf(c) + 1 : (c === ' ' ? '/' : ''); }).filter(Boolean).join('-'); else o = String(v.t).split(/[^0-9]+/).filter(Boolean).map(function (n) { return +n >= 1 && +n <= 26 ? A[+n - 1] : '?'; }).join(''); return { results: [MT('Result', o)] }; });
  var MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.' };
  var MREV = {}; Object.keys(MORSE).forEach(function (k) { MREV[MORSE[k]] = k; });
  C('morse-code-translator', 'Morse Code Translator', CG, 'Translate text to Morse and Morse back to text.', 'Letters are separated by a space, words by “/”.',
    [['t', 'Text or Morse', 'ta', 'SOS HELP']],
    function (v) { var s = String(v.t).trim(); if (!s) return { error: 'Enter text or Morse.' }; var isM = /^[.\-/\s·–−_|]+$/.test(s); if (isM) { var o = s.replace(/[·]/g, '.').replace(/[–−_]/g, '-').split(/\s*[/|]\s*|\s{3,}/).map(function (w) { return w.trim().split(/\s+/).map(function (c) { return MREV[c] || '?'; }).join(''); }).join(' '); return { results: [MT('Text', o), T('Detected', 'Morse → text')] }; } var m = s.toUpperCase().split('').map(function (c) { return c === ' ' ? '/' : (MORSE[c] || ''); }).filter(Boolean).join(' '); return { results: [MT('Morse', m), T('Detected', 'Text → Morse')], html: pre(m) }; }, { pop: 1 });
  var NATO = { A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu', 0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine' };
  C('nato-phonetic-alphabet-translator', 'NATO Phonetic Alphabet Translator', CG, 'Spell any word with Alfa, Bravo, Charlie…', 'ICAO/NATO spelling alphabet.',
    [['t', 'Text', 'ta', 'Calcyworld 2026']],
    function (v) { var o = String(v.t).toUpperCase().split('').map(function (c) { return NATO[c] || (c === ' ' ? '·' : ''); }).filter(Boolean).join(' '); return { results: [MT('Phonetic spelling', o)] }; });
  C('leetspeak-converter', 'Leetspeak (1337) Converter', CG, 'Turn normal text into leetspeak.', 'a→4 e→3 i→1 o→0 s→5 t→7.',
    [['t', 'Text', 'ta', 'Elite hacker mode'], ['l', 'Level', 'g', 1, [[1, 'Light'], [2, 'Heavy']]]],
    function (v) { var L = +v.l === 1 ? { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7' } : { a: '4', b: '8', e: '3', g: '9', i: '1', l: '1', o: '0', s: '5', t: '7', z: '2' }; return { results: [MT('1337', v.t.replace(/[a-z]/gi, function (c) { return L[c.toLowerCase()] || c; }))] }; });
  C('pig-latin-translator', 'Pig Latin Translator', CG, 'Translate English into Pig Latin.', 'Move leading consonants to the end and add “ay”.',
    [['t', 'Text', 'ta', 'Hello world this is pig latin']],
    function (v) { var o = v.t.replace(/[A-Za-z]+/g, function (w) { var m = /^([^aeiouAEIOU]*)(.*)$/.exec(w); if (!m[1]) return w + 'way'; var r = m[2] + m[1].toLowerCase() + 'ay'; return w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase() ? r.charAt(0).toUpperCase() + r.slice(1) : r; }); return { results: [MT('Pig Latin', o)] }; });

  /* ---------- passwords & keys ---------- */
  var human = function (sec) {
    if (!isFinite(sec)) return 'effectively forever'; if (sec < 1) return 'instantly';
    var u = [['second', 1], ['minute', 60], ['hour', 3600], ['day', 86400], ['year', 31557600], ['thousand years', 31557600e3], ['million years', 31557600e6], ['billion years', 31557600e9]], i = 0;
    while (i < u.length - 1 && sec >= u[i + 1][1]) i++; var n = sec / u[i][1]; if (i === 7 && n > 1e6) return 'longer than the age of the universe'; var s = n >= 100 ? Math.round(n).toLocaleString('en') : (Math.round(n * 10) / 10); return s + ' ' + u[i][0] + (n >= 2 && i < 5 ? 's' : '');
  };
  var COMMON = ['password', '123456', '123456789', 'qwerty', 'abc123', 'letmein', 'welcome', 'admin', 'iloveyou', 'monkey', 'dragon', 'football', 'login', 'passw0rd', 'master', 'sunshine', 'princess', '111111', '000000', 'qwerty123', 'india123', 'admin123', 'test'];
  C('password-strength-calculator', 'Password Strength & Crack-Time Calculator', CG, 'Entropy and estimated crack time — checked only in your browser.', 'Entropy = length × log2(character pool); minus penalties for common patterns.',
    [['p', 'Password (never sent anywhere)', 't', 'Tr0ub4dor&3-purple-Horse'], ['g', 'Attacker speed', 's', 1e10, [[1e4, 'Online login (10k/s)'], [1e8, 'Slow hash (bcrypt-ish, 100M/s)'], [1e10, 'Fast hash GPU (10B/s)'], [1e12, 'Big cracking rig (1T/s)']]]],
    function (v) { var p = String(v.p); if (!p) return { error: 'Type a password to test.' }; var pool = 0; if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26; if (/\d/.test(p)) pool += 10; if (/[^A-Za-z0-9]/.test(p)) pool += 33; var h = p.length * Math.log2(pool || 1), notes = [];
      if (COMMON.indexOf(p.toLowerCase()) > -1) { h = Math.min(h, 10); notes.push('is on the most-used list'); } if (/(.)\1{2,}/.test(p)) { h -= 6; notes.push('repeats characters'); } if (/(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|qwer|asdf|zxcv)/i.test(p)) { h -= 8; notes.push('contains a keyboard/number sequence'); } if (/^[a-z]+\d{1,4}$/i.test(p)) { h -= 6; notes.push('is a word plus digits'); } h = Math.max(h, 1);
      var secs = Math.pow(2, h) / 2 / +v.g, rate = h < 28 ? 'Very weak' : h < 36 ? 'Weak' : h < 60 ? 'Fair' : h < 80 ? 'Strong' : 'Very strong';
      return { results: [MT('Strength', rate), Nm('Entropy', h, 1, 'bits'), T('Average crack time', human(secs)), Nm('Length', p.length), Nm('Character pool', pool), T('Pattern notes', notes.length ? 'Password ' + notes.join(', ') : 'No common patterns found')], note: 'Estimates only. Use a unique password for every site and a password manager.' }; }, { pop: 1 });
  C('passphrase-entropy-calculator', 'Passphrase Entropy Calculator', CG, 'Strength of a random-word passphrase (diceware style).', 'Entropy = words × log2(word list size).',
    [['w', 'Words', 'i', 5], ['l', 'Word list size', 's', 7776, [[7776, 'Diceware (7,776)'], [2048, 'BIP-39 (2,048)'], [1296, 'Short list (1,296)'], [10000, 'Common-word list (10,000)']]], ['g', 'Attacker speed', 's', 1e10, [[1e4, '10k guesses/s'], [1e10, '10 billion/s'], [1e12, '1 trillion/s']]]],
    function (v) { var h = v.w * Math.log2(+v.l); return { results: [M('Entropy', h, 'num', { dp: 1, u: 'bits' }), T('Average crack time', human(Math.pow(2, h) / 2 / +v.g)), Nm('Combinations (log10)', v.w * Math.log10(+v.l), 1), T('Rating', h < 40 ? 'Weak' : h < 64 ? 'Good' : h < 80 ? 'Strong' : 'Excellent')] }; });
  C('brute-force-time-calculator', 'Brute-force Time Calculator (Key Size)', CG, 'How long exhaustive key search takes for a given key size.', 'Time = 2^(bits−1) ÷ guesses per second.',
    [['b', 'Key size (bits)', 'i', 128], ['g', 'Guesses per second', 's', 1e12, [[1e9, '1 billion'], [1e12, '1 trillion'], [1e15, '1 quadrillion'], [1e18, '1 quintillion']]]],
    function (v) { var sec = Math.pow(2, v.b - 1) / +v.g; return { results: [MT('Average time to crack', human(sec)), Nm('Key space (log10)', v.b * Math.log10(2), 1), Nm('Seconds (log10)', Math.log10(sec), 1)] }; });
  var rnd = function (n) { var a = new Uint8Array(n); if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(a); else for (var i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256); return a; };
  C('uuid-generator-calculator', 'UUID / GUID Generator (v4)', CG, 'Random version-4 UUIDs, generated in your browser.', 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
    [['n', 'How many', 'i', 5], ['u', 'UPPERCASE', 'c', 0], ['b', 'Remove hyphens', 'c', 0]],
    function (v) { var n = Math.max(1, Math.min(100, Math.round(v.n))), out = []; for (var i = 0; i < n; i++) { var r = rnd(16); r[6] = (r[6] & 15) | 64; r[8] = (r[8] & 63) | 128; var h = hexOf(r); var s = h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20); if (v.u) s = s.toUpperCase(); if (v.b) s = s.replace(/-/g, ''); out.push(s); } return { results: [MT('First UUID', out[0]), Nm('Generated', n)], html: pre(out.join('\n')) }; });
  C('random-hex-key-generator', 'Random Key / Token Generator', CG, 'Cryptographically random hex, Base64 or alphanumeric keys.', 'Uses crypto.getRandomValues when the browser provides it.',
    [['l', 'Length (bytes)', 'i', 32], ['f', 'Format', 'g', 1, [[1, 'Hex'], [2, 'Base64'], [3, 'Alphanumeric']]], ['n', 'How many', 'i', 3]],
    function (v) { var L = Math.max(4, Math.min(256, Math.round(v.l))), n = Math.max(1, Math.min(50, Math.round(v.n))), out = []; for (var i = 0; i < n; i++) { var r = rnd(L); out.push(+v.f === 1 ? hexOf(r) : +v.f === 2 ? b64enc(r) : Array.prototype.map.call(r, function (x) { return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[x % 62]; }).join('')); } return { results: [MT('Key', out[0]), Nm('Entropy', L * 8, 0, 'bits')], html: pre(out.join('\n')) }; });
  C('luhn-credit-card-validator', 'Luhn Check & Credit Card Validator', CG, 'Validate a card/ID number with the Luhn algorithm and find its network.', 'Double every second digit from the right and sum.',
    [['n', 'Number', 't', '4539 1488 0343 6467']],
    function (v) { var d = String(v.n).replace(/\D/g, ''); if (d.length < 8) return { error: 'Enter at least 8 digits.' };
      var lsum = function (str, dbl) { var s = 0, alt = dbl; for (var i = str.length - 1; i >= 0; i--) { var x = +str[i]; if (alt) { x *= 2; if (x > 9) x -= 9; } s += x; alt = !alt; } return s; };
      var ok = lsum(d, false) % 10 === 0, cd = (10 - lsum(d.slice(0, -1), true) % 10) % 10;
      var net = /^4/.test(d) ? 'Visa' : /^(5[1-5]|2[2-7])/.test(d) ? 'Mastercard' : /^3[47]/.test(d) ? 'American Express' : /^(6011|65|64[4-9])/.test(d) ? 'Discover' : /^(60|65|81|82|508)/.test(d) ? 'RuPay' : /^35/.test(d) ? 'JCB' : /^3(0[0-5]|[68])/.test(d) ? 'Diners Club' : 'Unknown';
      return { results: [MT('Luhn check', ok ? 'Valid' : 'Invalid'), T('Network', net), Nm('Digits', d.length), Nm('Correct last digit would be', cd)], note: 'Only checks the number format. It does not mean the card is real or active.' }; });
  C('iban-validator-calculator', 'IBAN Validator', CG, 'Check an IBAN with the ISO 13616 mod-97 test.', 'Move the first 4 characters to the end, convert letters to numbers, mod 97 must equal 1.',
    [['i', 'IBAN', 't', 'GB82 WEST 1234 5698 7654 32']],
    function (v) { var s = String(v.i).replace(/\s+/g, '').toUpperCase(); if (!/^[A-Z]{2}\d{2}[A-Z0-9]{8,30}$/.test(s)) return { error: 'An IBAN starts with 2 letters, 2 digits, then up to 30 letters/digits.' }; var L = { GB: 22, DE: 22, FR: 27, ES: 24, IT: 27, NL: 18, BE: 16, CH: 21, AT: 20, PT: 25, IE: 22, SE: 24, NO: 15, DK: 18, FI: 18, PL: 28, AE: 23, SA: 24, TR: 26, GR: 27 }; var t = s.slice(4) + s.slice(0, 4), n = ''; for (var i = 0; i < t.length; i++) { var c = t.charCodeAt(i); n += c >= 65 ? String(c - 55) : t[i]; } var rem = 0; for (i = 0; i < n.length; i++) rem = (rem * 10 + +n[i]) % 97;
      var lenOk = !L[s.slice(0, 2)] || L[s.slice(0, 2)] === s.length; return { results: [MT('IBAN', rem === 1 && lenOk ? 'Valid' : 'Invalid'), T('Country', s.slice(0, 2)), Nm('Length', s.length), T('Check digits', s.slice(2, 4)), T('Formatted', s.replace(/(.{4})/g, '$1 ').trim())] }; });
  C('isbn-validator-converter', 'ISBN-10 / ISBN-13 Validator & Converter', CG, 'Validate an ISBN and convert between ISBN-10 and ISBN-13.', 'ISBN-13 check digit uses weights 1 and 3.',
    [['i', 'ISBN', 't', '978-0-306-40615-7']],
    function (v) { var s = String(v.i).replace(/[^0-9Xx]/g, '').toUpperCase(), i, ok, i10, i13; if (s.length === 13 && /^\d{13}$/.test(s)) { var t = 0; for (i = 0; i < 12; i++) t += +s[i] * (i % 2 ? 3 : 1); var cd = (10 - t % 10) % 10; ok = cd === +s[12]; i13 = s; if (s.slice(0, 3) === '978') { var b = s.slice(3, 12), u = 0; for (i = 0; i < 9; i++) u += +b[i] * (10 - i); var c10 = (11 - u % 11) % 11; i10 = b + (c10 === 10 ? 'X' : c10); } } else if (s.length === 10 && /^\d{9}[\dX]$/.test(s)) { var u2 = 0; for (i = 0; i < 10; i++) u2 += (s[i] === 'X' ? 10 : +s[i]) * (10 - i); ok = u2 % 11 === 0; i10 = s; var b2 = '978' + s.slice(0, 9), t2 = 0; for (i = 0; i < 12; i++) t2 += +b2[i] * (i % 2 ? 3 : 1); i13 = b2 + (10 - t2 % 10) % 10; } else return { error: 'An ISBN has 10 or 13 digits.' }; return { results: [MT('Check', ok ? 'Valid' : 'Invalid check digit'), T('ISBN-13', i13 || 'n/a'), T('ISBN-10', i10 || 'n/a (979 prefix)')] }; });
})(window.CW);
