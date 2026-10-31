// 2026-10-31 local startup adaptation: retains initialization, clears observed splash fields, re-encrypts and signs.
// 中国移动去广告（Surge 移植版）
// 移植改动：
//   1. 前置纯 JS AES-128-CBC 垫片，模拟 Loon 的 $crypto.aes（Surge 没有该 API）。
//   2. $argument 由对象改为分号分隔字符串解析，模块 #!arguments 保留 8 个开关。
//   3. 补 Loon Rewrite 两条：支付弹窗 data=null、广告过滤接口 body=[]。
// 其余逻辑与原脚本一致。
// Surge 移植垫片：模拟 Loon 的 $crypto.aes（AES-CBC + PKCS7）。
// S-box 由 GF(2^8) 逆元 + 仿射变换程序生成，不依赖硬编码大表。
// 所有辅助函数带 __cm_ 前缀，置于文件顶层，原脚本 IIFE 内可直接访问。
// $crypto 只在平台未提供时定义（即 Surge 环境），Loon 下用平台实现。
function __cm_gfMul(a, b) {
  var p = 0;
  for (var i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    var hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p;
}
function __cm_gfPow(a, e) {
  var r = 1;
  while (e) {
    if (e & 1) r = __cm_gfMul(r, a);
    a = __cm_gfMul(a, a);
    e >>= 1;
  }
  return r;
}
function __cm_rotl8(x, n) {
  return ((x << n) | (x >> (8 - n))) & 0xff;
}
var __cm_SBOX = new Array(256);
var __cm_INV_SBOX = new Array(256);
for (var __cm_i = 0; __cm_i < 256; __cm_i++) {
  var __cm_inv = __cm_i === 0 ? 0 : __cm_gfPow(__cm_i, 254);
  var __cm_s = (__cm_inv ^ __cm_rotl8(__cm_inv, 1) ^ __cm_rotl8(__cm_inv, 2) ^ __cm_rotl8(__cm_inv, 3) ^ __cm_rotl8(__cm_inv, 4) ^ 0x63) & 0xff;
  __cm_SBOX[__cm_i] = __cm_s;
  __cm_INV_SBOX[__cm_s] = __cm_i;
}
function __cm_expandKey(keyBytes) {
  var Nk = keyBytes.length / 4;
  var Nr = Nk + 6;
  var w = new Array(4 * (Nr + 1));
  for (var i = 0; i < Nk; i++) {
    w[i] = ((keyBytes[4 * i] << 24) | (keyBytes[4 * i + 1] << 16) | (keyBytes[4 * i + 2] << 8) | keyBytes[4 * i + 3]) >>> 0;
  }
  var rcon = 1;
  for (i = Nk; i < 4 * (Nr + 1); i++) {
    var t = w[i - 1];
    if (i % Nk === 0) {
      t = (((__cm_SBOX[(t >> 16) & 0xff] << 24) | (__cm_SBOX[(t >> 8) & 0xff] << 16) | (__cm_SBOX[t & 0xff] << 8) | __cm_SBOX[(t >> 24) & 0xff]) ^ (rcon << 24)) >>> 0;
      rcon = __cm_gfMul(rcon, 2);
    } else if (Nk > 6 && i % Nk === 4) {
      t = ((__cm_SBOX[(t >> 24) & 0xff] << 24) | (__cm_SBOX[(t >> 16) & 0xff] << 16) | (__cm_SBOX[(t >> 8) & 0xff] << 8) | __cm_SBOX[t & 0xff]) >>> 0;
    }
    w[i] = (w[i - Nk] ^ t) >>> 0;
  }
  return { w: w, Nr: Nr };
}
function __cm_addRoundKey(s, w, round) {
  for (var c = 0; c < 4; c++) {
    var word = w[round * 4 + c];
    s[4 * c] ^= (word >>> 24) & 0xff;
    s[4 * c + 1] ^= (word >>> 16) & 0xff;
    s[4 * c + 2] ^= (word >>> 8) & 0xff;
    s[4 * c + 3] ^= word & 0xff;
  }
}
function __cm_subBytes(s) {
  for (var i = 0; i < 16; i++) s[i] = __cm_SBOX[s[i]];
}
function __cm_invSubBytes(s) {
  for (var i = 0; i < 16; i++) s[i] = __cm_INV_SBOX[s[i]];
}
function __cm_shiftRows(s) {
  var t = s.slice();
  for (var r = 1; r < 4; r++) for (var c = 0; c < 4; c++) s[4 * c + r] = t[4 * ((c + r) % 4) + r];
}
function __cm_invShiftRows(s) {
  var t = s.slice();
  for (var r = 1; r < 4; r++) for (var c = 0; c < 4; c++) s[4 * c + r] = t[4 * ((c - r + 4) % 4) + r];
}
function __cm_mixColumns(s) {
  for (var c = 0; c < 4; c++) {
    var i = 4 * c;
    var a0 = s[i], a1 = s[i + 1], a2 = s[i + 2], a3 = s[i + 3];
    s[i] = __cm_gfMul(a0, 2) ^ __cm_gfMul(a1, 3) ^ a2 ^ a3;
    s[i + 1] = a0 ^ __cm_gfMul(a1, 2) ^ __cm_gfMul(a2, 3) ^ a3;
    s[i + 2] = a0 ^ a1 ^ __cm_gfMul(a2, 2) ^ __cm_gfMul(a3, 3);
    s[i + 3] = __cm_gfMul(a0, 3) ^ a1 ^ a2 ^ __cm_gfMul(a3, 2);
  }
}
function __cm_invMixColumns(s) {
  for (var c = 0; c < 4; c++) {
    var i = 4 * c;
    var a0 = s[i], a1 = s[i + 1], a2 = s[i + 2], a3 = s[i + 3];
    s[i] = __cm_gfMul(a0, 14) ^ __cm_gfMul(a1, 11) ^ __cm_gfMul(a2, 13) ^ __cm_gfMul(a3, 9);
    s[i + 1] = __cm_gfMul(a0, 9) ^ __cm_gfMul(a1, 14) ^ __cm_gfMul(a2, 11) ^ __cm_gfMul(a3, 13);
    s[i + 2] = __cm_gfMul(a0, 13) ^ __cm_gfMul(a1, 9) ^ __cm_gfMul(a2, 14) ^ __cm_gfMul(a3, 11);
    s[i + 3] = __cm_gfMul(a0, 11) ^ __cm_gfMul(a1, 13) ^ __cm_gfMul(a2, 9) ^ __cm_gfMul(a3, 14);
  }
}
function __cm_encryptBlock(input, exp) {
  var s = input.slice();
  __cm_addRoundKey(s, exp.w, 0);
  for (var round = 1; round < exp.Nr; round++) {
    __cm_subBytes(s);
    __cm_shiftRows(s);
    __cm_mixColumns(s);
    __cm_addRoundKey(s, exp.w, round);
  }
  __cm_subBytes(s);
  __cm_shiftRows(s);
  __cm_addRoundKey(s, exp.w, exp.Nr);
  return s;
}
function __cm_decryptBlock(input, exp) {
  var s = input.slice();
  __cm_addRoundKey(s, exp.w, exp.Nr);
  for (var round = exp.Nr - 1; round >= 1; round--) {
    __cm_invShiftRows(s);
    __cm_invSubBytes(s);
    __cm_addRoundKey(s, exp.w, round);
    __cm_invMixColumns(s);
  }
  __cm_invShiftRows(s);
  __cm_invSubBytes(s);
  __cm_addRoundKey(s, exp.w, 0);
  return s;
}
function __cm_toArray(data) {
  var out = new Array(data.length);
  for (var i = 0; i < data.length; i++) out[i] = data[i] & 0xff;
  return out;
}
function __cm_cbcEncrypt(data, key, iv) {
  var exp = __cm_expandKey(key);
  var pad = 16 - (data.length % 16);
  var out = [];
  var prev = iv.slice();
  for (var off = 0; off < data.length + pad; off += 16) {
    var block = new Array(16);
    for (var i = 0; i < 16; i++) {
      block[i] = ((off + i < data.length ? data[off + i] : pad) ^ prev[i]) & 0xff;
    }
    var enc = __cm_encryptBlock(block, exp);
    for (var j = 0; j < 16; j++) out.push(enc[j]);
    prev = enc;
  }
  return out;
}
function __cm_cbcDecrypt(data, key, iv) {
  if (data.length === 0 || data.length % 16 !== 0) throw new Error("bad ciphertext length");
  var exp = __cm_expandKey(key);
  var out = [];
  var prev = iv.slice();
  for (var off = 0; off < data.length; off += 16) {
    var block = data.slice(off, off + 16);
    var dec = __cm_decryptBlock(block, exp);
    for (var i = 0; i < 16; i++) dec[i] ^= prev[i];
    for (var j = 0; j < 16; j++) out.push(dec[j]);
    prev = block;
  }
  var pad = out[out.length - 1];
  if (pad < 1 || pad > 16) throw new Error("bad padding");
  for (var i = 0; i < pad; i++) {
    if (out[out.length - 1 - i] !== pad) throw new Error("bad padding");
  }
  return out.slice(0, out.length - pad);
}
if (typeof $crypto === "undefined") {
  var $crypto = {
    aes: {
      encrypt: function (data, opts) {
        if (!opts || opts.mode !== "cbc" || opts.padding !== "pkcs7") throw new Error("unsupported aes options");
        return { ciphertext: __cm_cbcEncrypt(__cm_toArray(data), __cm_toArray(opts.key), __cm_toArray(opts.iv)) };
      },
      decrypt: function (data, opts) {
        if (!opts || opts.mode !== "cbc" || opts.padding !== "pkcs7") throw new Error("unsupported aes options");
        return __cm_cbcDecrypt(__cm_toArray(data), __cm_toArray(opts.key), __cm_toArray(opts.iv));
      }
    }
  };
}

// Surge 移植：$argument 解析。Loon 传对象，Surge 传字符串（模块 argument 参数）。
// 字符串格式为分号分隔的 k:v（模块里拼，不含逗号，避免 [Script] 行解析问题）。
// 无法识别的值不写入，交给脚本内 ARGUMENT_DEFAULTS 兜底（占位符未替换时也安全）。
function __parseSurgeArgs() {
  var a = (typeof $argument !== "undefined") ? $argument : undefined;
  if (a && typeof a === "object") return a;
  var o = {};
  if (typeof a === "string") {
    var parts = a.split(";");
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split(":");
      if (kv.length === 2) {
        if (kv[1] === "true" || kv[1] === "1") o[kv[0]] = true;
        else if (kv[1] === "false" || kv[1] === "0") o[kv[0]] = false;
      }
    }
  }
  return o;
}

(function () {
  "use strict";

  if (
    typeof $response !== "object" ||
    Number($response.status) !== 200 ||
    !$response.body ||
    typeof $request !== "object" ||
    !$request.url
  ) {
    $done({});
    return;
  }

  var responseBody = $response.body;
  var url = String($request.url);

  var AES_KEY = "RYV0hCV1lV25KYVJ";
  var AES_IV = "VjFSQ1ZtVkQxRTlQ";
  var H5_AES_KEY = "UVic06tpXgMNiApm";
  var H5_AES_IV = "9791027341711819";
  var RECHARGE_AES_KEY = "043AOQGK6ykklyZA";

  var ARGUMENTS = __parseSurgeArgs();

  var ARGUMENT_DEFAULTS = {
    HideTopFamily: false,
    HideTopAge: false,
    HideTopPhone: false,
    HideTopNearby: false,
    HideTopAI: false,
    HideTopEnterprise: false,
    BottomClean: true,
    MineClean: true
  };

  function enabled(name) {
    var value = Object.prototype.hasOwnProperty.call(ARGUMENTS, name)
      ? ARGUMENTS[name]
      : ARGUMENT_DEFAULTS[name];
    return value === true || value === "true" || value === 1 || value === "1";
  }

  // Surge 移植补充：Loon Rewrite 两条（原 response.json 改写），在解密前处理。
  if (/\/i\/v1\/pay\/popWindowQry\//.test(url)) {
    try {
      var __pop = JSON.parse(responseBody);
      if (__pop && typeof __pop === "object") __pop.data = null;
      $done({body: JSON.stringify(__pop)});
    } catch (e) { $done({}); }
    return;
  }
  if (/AdInfoFilter\/getAdInfos(?:\?|$)/.test(url) && enabled("MineClean")) {
    try {
      var __ad = JSON.parse(responseBody);
      if (__ad && typeof __ad === "object") __ad.body = [];
      $done({body: JSON.stringify(__ad)});
    } catch (e) { $done({}); }
    return;
  }

  var isNavigationRequest = /\/DN\/init\/getNavigation(?:\?|$)/.test(url);
  if (
    isNavigationRequest &&
    !enabled("HideTopFamily") &&
    !enabled("HideTopAge") &&
    !enabled("HideTopPhone") &&
    !enabled("HideTopNearby") &&
    !enabled("HideTopAI") &&
    !enabled("HideTopEnterprise") &&
    !enabled("BottomClean")
  ) {
    $done({});
    return;
  }

  var isBottomNavigationRequest = /\/DN\/bottomNavigationService\/getNavigationInfo(?:\?|$)/.test(url);
  if (isBottomNavigationRequest && !enabled("BottomClean")) {
    $done({});
    return;
  }

  var isMyPageRequest = /\/DN\/myPageNew\/getMyPageNew(?:\?|$)/.test(url);
  if (isMyPageRequest && !enabled("MineClean")) {
    $done({});
    return;
  }

  var isRechargeRequest = /\/i\/v1\/cust\/(?:aiMainQry|iopBatchQry)\//.test(url);
  var isH5Request =
    /\/(?:DH\/(?:message_query\/message\/query\/list|myCardVoucher\/getBannerList)|DA\/commonBoard\/getCommonBoard)(?:\?|$)/.test(url);
  var xPen = isRechargeRequest
    ? ""
    : String(getHeader($response.headers, "x-pen"));

  if (
    (!isRechargeRequest && isH5Request && xPen !== "1") ||
    (!isRechargeRequest && !isH5Request && xPen !== "14")
  ) {
    $done({});
    return;
  }

  function utf8Encode(text) {
    var bytes = [];
    for (var i = 0; i < text.length; i++) {
      var code = text.charCodeAt(i);
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
        var low = text.charCodeAt(i + 1);
        if (low >= 0xdc00 && low <= 0xdfff) {
          code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
          i++;
        }
      }
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if (code < 0x10000) {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      } else {
        bytes.push(
          0xf0 | (code >> 18),
          0x80 | ((code >> 12) & 0x3f),
          0x80 | ((code >> 6) & 0x3f),
          0x80 | (code & 0x3f)
        );
      }
    }
    return bytes;
  }

  function utf8Decode(bytes) {
    var chunks = [];
    var codes = new Array(8192);
    var output = 0;
    for (var i = 0; i < bytes.length;) {
      var first = bytes[i++];
      var code;
      if (first < 0x80) {
        code = first;
      } else if ((first & 0xe0) === 0xc0) {
        code = ((first & 0x1f) << 6) | (bytes[i++] & 0x3f);
      } else if ((first & 0xf0) === 0xe0) {
        code = ((first & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
      } else {
        code = ((first & 0x07) << 18) |
          ((bytes[i++] & 0x3f) << 12) |
          ((bytes[i++] & 0x3f) << 6) |
          (bytes[i++] & 0x3f);
      }
      if (code <= 0xffff) {
        codes[output++] = code;
      } else {
        code -= 0x10000;
        codes[output++] = 0xd800 | (code >> 10);
        codes[output++] = 0xdc00 | (code & 0x3ff);
      }
      if (output >= 8190) {
        chunks.push(String.fromCharCode.apply(null, codes.slice(0, output)));
        output = 0;
      }
    }
    if (output) chunks.push(String.fromCharCode.apply(null, codes.slice(0, output)));
    return chunks.join("");
  }

  var BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var BASE64_DECODE = (function () {
    var map = [];
    for (var i = 0; i < 64; i++) map[BASE64.charCodeAt(i)] = i;
    return map;
  })();

  function base64Decode(text) {
    text = String(text).replace(/\s+/g, "");
    var length = text.length;
    if (!length || length % 4 !== 0) throw new Error("base64");
    var padding = text.charCodeAt(length - 1) === 61
      ? (text.charCodeAt(length - 2) === 61 ? 2 : 1)
      : 0;
    var bytes = new Array((length >>> 2) * 3 - padding);
    var output = 0;
    for (var i = 0; i < length; i += 4) {
      var c0 = BASE64_DECODE[text.charCodeAt(i)];
      var c1 = BASE64_DECODE[text.charCodeAt(i + 1)];
      var code2 = text.charCodeAt(i + 2);
      var code3 = text.charCodeAt(i + 3);
      var c2 = code2 === 61 ? 0 : BASE64_DECODE[code2];
      var c3 = code3 === 61 ? 0 : BASE64_DECODE[code3];
      if (
        c0 === undefined ||
        c1 === undefined ||
        c2 === undefined ||
        c3 === undefined
      ) throw new Error("base64");
      var value = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
      bytes[output++] = (value >>> 16) & 0xff;
      if (code2 !== 61) bytes[output++] = (value >>> 8) & 0xff;
      if (code3 !== 61) bytes[output++] = value & 0xff;
    }
    return bytes;
  }

  function base64Encode(bytes) {
    var text = "";
    for (var i = 0; i < bytes.length; i += 3) {
      var a = bytes[i];
      var b = i + 1 < bytes.length ? bytes[i + 1] : 0;
      var c = i + 2 < bytes.length ? bytes[i + 2] : 0;
      var value = (a << 16) | (b << 8) | c;
      text += BASE64.charAt((value >>> 18) & 0x3f);
      text += BASE64.charAt((value >>> 12) & 0x3f);
      text += i + 1 < bytes.length ? BASE64.charAt((value >>> 6) & 0x3f) : "=";
      text += i + 2 < bytes.length ? BASE64.charAt(value & 0x3f) : "=";
    }
    return text;
  }

  function aesCbcEncrypt(bytes, key, iv) {
    return $crypto.aes.encrypt(new Uint8Array(bytes), {
      mode: "cbc",
      key: new Uint8Array(key),
      iv: new Uint8Array(iv),
      padding: "pkcs7"
    }).ciphertext;
  }

  function aesCbcDecrypt(bytes, key, iv) {
    return $crypto.aes.decrypt(new Uint8Array(bytes), {
      mode: "cbc",
      key: new Uint8Array(key),
      iv: new Uint8Array(iv),
      padding: "pkcs7"
    });
  }

  function leftRotate(value, count) {
    return ((value << count) | (value >>> (32 - count))) >>> 0;
  }

  function md5(text) {
    var bytes = utf8Encode(text);
    var bitLength = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    var low = bitLength >>> 0;
    var high = Math.floor(bitLength / 0x100000000) >>> 0;
    for (var i = 0; i < 4; i++) bytes.push((low >>> (8 * i)) & 0xff);
    for (i = 0; i < 4; i++) bytes.push((high >>> (8 * i)) & 0xff);

    var shifts = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
      5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
      4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
      6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];
    var constants = [];
    for (i = 0; i < 64; i++) constants[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;

    var a0 = 0x67452301;
    var b0 = 0xefcdab89;
    var c0 = 0x98badcfe;
    var d0 = 0x10325476;

    for (var offset = 0; offset < bytes.length; offset += 64) {
      var words = new Array(16);
      for (i = 0; i < 16; i++) {
        var at = offset + i * 4;
        words[i] = (bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16) | (bytes[at + 3] << 24)) >>> 0;
      }
      var a = a0;
      var b = b0;
      var c = c0;
      var d = d0;
      for (i = 0; i < 64; i++) {
        var f;
        var g;
        if (i < 16) {
          f = (b & c) | (~b & d);
          g = i;
        } else if (i < 32) {
          f = (d & b) | (~d & c);
          g = (5 * i + 1) % 16;
        } else if (i < 48) {
          f = b ^ c ^ d;
          g = (3 * i + 5) % 16;
        } else {
          f = c ^ (b | ~d);
          g = (7 * i) % 16;
        }
        var oldD = d;
        d = c;
        c = b;
        var sum = (a + (f >>> 0) + constants[i] + words[g]) >>> 0;
        b = (b + leftRotate(sum, shifts[i])) >>> 0;
        a = oldD;
      }
      a0 = (a0 + a) >>> 0;
      b0 = (b0 + b) >>> 0;
      c0 = (c0 + c) >>> 0;
      d0 = (d0 + d) >>> 0;
    }

    function littleEndianHex(value) {
      var result = "";
      for (var i = 0; i < 4; i++) result += ("0" + ((value >>> (i * 8)) & 0xff).toString(16)).slice(-2);
      return result;
    }

    return littleEndianHex(a0) + littleEndianHex(b0) + littleEndianHex(c0) + littleEndianHex(d0);
  }

  function getHeader(headers, wanted) {
    if (!headers) return undefined;
    wanted = wanted.toLowerCase();
    for (var name in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, name) && name.toLowerCase() === wanted) return headers[name];
    }
    return undefined;
  }

  function setHeader(headers, wanted, value) {
    var lower = wanted.toLowerCase();
    for (var name in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, name) && name.toLowerCase() === lower) {
        headers[name] = value;
        return;
      }
    }
    headers[wanted] = value;
  }

  function deleteHeader(headers, wanted) {
    var lower = wanted.toLowerCase();
    for (var name in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, name) && name.toLowerCase() === lower) delete headers[name];
    }
  }

  function decryptJson(ciphertext, keyText, ivText) {
    return JSON.parse(
      utf8Decode(
        aesCbcDecrypt(
          base64Decode(ciphertext),
          utf8Encode(keyText),
          utf8Encode(ivText)
        )
      )
    );
  }

  function encryptJson(payload, keyText, ivText) {
    return base64Encode(
      aesCbcEncrypt(
        utf8Encode(JSON.stringify(payload)),
        utf8Encode(keyText),
        utf8Encode(ivText)
      )
    );
  }

  function signedResult(body) {
    var nonce = getHeader($request.headers, "x-nonce");
    if (nonce === undefined || nonce === null || nonce === "") {
      throw new Error("nonce");
    }

    var headers = {};
    var originalHeaders = $response.headers || {};
    for (var name in originalHeaders) {
      if (Object.prototype.hasOwnProperty.call(originalHeaders, name)) {
        headers[name] = originalHeaders[name];
      }
    }
    setHeader(headers, "r-token", md5(String(nonce) + "+" + body));
    deleteHeader(headers, "content-length");
    return { body: body, headers: headers };
  }


  // Startup schema observed on-device on 2026-10-31.
  // Preserve successful initialization, only clear the startup-ad payload.
  function filterStartup(payload) {
    if (!payload || String(payload.retCode) !== "000000") return false;
    var body = payload.rspBody;
    if (!body || typeof body !== "object" || Array.isArray(body)) return false;
    var changed = false;
    if (body.startImgInfo && typeof body.startImgInfo === "object" &&
        !Array.isArray(body.startImgInfo) && Object.keys(body.startImgInfo).length) {
      body.startImgInfo = {};
      changed = true;
    }
    ["startImgurl", "videoUrl", "actionUrl", "marketId", "videoMarketId"].forEach(function(key) {
      if (typeof body[key] === "string" && body[key] !== "") {
        body[key] = "";
        changed = true;
      }
    });
    if (typeof body.sdkAdWaitTime === "number" && body.sdkAdWaitTime !== 0) {
      body.sdkAdWaitTime = 0;
      changed = true;
    }
    return changed;
  }
  try {
    var declaredLength = parseInt(getHeader($response.headers, "content-length"), 10);
    if (declaredLength > 0 && declaredLength < responseBody.length) {
      responseBody = responseBody.slice(0, declaredLength);
    }
    var payload = decryptJson(responseBody, AES_KEY, AES_IV);
    if (!filterStartup(payload)) {
      $done({});
      return;
    }
    var result = signedResult(encryptJson(payload, AES_KEY, AES_IV));
    $done(result);
  } catch (error) {
    $done({});
  }
})();
