/*! nermal v1.1.0 | (c) 2013 Chris Drost | Open-source under the 2-clause BSD License
 */

/*global window, exports, require, Buffer, Uint8Array */
/*jslint bitwise: true, plusplus: true, nomen: true */

var nermal = (function (api) {
    "use strict";
    var b64, sjcl, scrypt, crypto, rand, ba_from_bytes, bytes_from_ba, version, re_compatible, err;
    version = "nermal 1.1.0";
    re_compatible = /^nermal 1\./;
    err = function (mode, msg) { return new Error("nermal/" + mode + ": " + msg); };

    // The following two functions convert Uint8Arrays to/from SJCL bitArrays.
    // SJCL does one thing which is a little crazy: sjcl.bitArray.partial()
    // expects the bits in the last integer to be little-endian but then puts
    // them into the bitarray as big-endian; so we handle that integer specially
    // in ba_from_bytes().
    ba_from_bytes = function (b) {
        var ba = [], i, last = b.length % 4, end = b.length - last;
        for (i = 0; i < end; i += 4) {
            ba.push(b[i] << 24 | b[i + 1] << 16 | b[i + 2] << 8 | b[i + 3]);
        }
        if (last !== 0) {
            ba.push(sjcl.bitArray.partial(last * 8, last === 1 ? b[i] :
                    last === 2 ? b[i] << 8 | b[i + 1] : b[i] << 16 | b[i + 1] << 8 | b[i + 2]
                ));
        }
        return ba;
    };
    bytes_from_ba = function (ba) {
        var i, k, b = new Uint8Array(sjcl.bitArray.bitLength(ba) / 8);
        for (i = k = 0; k < ba.length; k++) {
            // tricky: Uint8Array's setter automatically truncates bytes and
            // silently fails if the index i is too high, so this works.
            b[i++] = ba[k] >> 24;
            b[i++] = ba[k] >> 16;
            b[i++] = ba[k] >> 8;
            b[i++] = ba[k];
        }
        return b;
    };

    /* Library setup */
    if (typeof require === "function" && typeof Buffer === "function") {
        // assume node.js
        sjcl = require('sjcl');
        scrypt = require('js-scrypt-em');
        crypto = require('crypto');
        rand = function (n) { return new Uint8Array(crypto.randomBytes(n)); };
        b64 = {
            enc: function (arr) {
                return new Buffer(arr).toString('base64');
            },
            dec: function (str) {
                return new Uint8Array(new Buffer(str, 'base64'));
            }
        };
    } else if (typeof window === "object") {
        // assume browser
        if (window.sjcl && window.scrypt_module_factory) {
            sjcl = window.sjcl;
            scrypt = window.scrypt_module_factory(Math.pow(2, 27));
        } else {
            throw err("lib", "Could not find sjcl and js-scrypt-em.");
        }
        if (window.crypto && window.crypto.getRandomValues) {
            rand = function (n) {
                var buf = new Uint8Array(n);
                window.crypto.getRandomValues(buf);
                return buf;
            };
        } else {
            throw err("rand", "No source of random data seems to be available.");
        }
        if (window.btoa && window.atob) {
            b64 = {
                enc: function (arr) {
                    return window.btoa(String.fromCharCode.apply(String, arr));
                },
                dec: function (str) {
                    var d = window.atob(str), i, b = new Uint8Array(d.length);
                    for (i = 0; i < d.length; i++) {
                        b[i] = d.charCodeAt(i);
                    }
                    return b;
                }
            };
        } else {
            throw err("bad_browser", "The Base64 library requires a browser which supports atob() and btoa()");
        }
    } else {
        throw err("lib", "Context does not seem to be a browser or node.js; not sure how to import libraries.");
    }
    // key derivation function: derives a key from a Uint8Array salt and string password.
    function kdf(salt, pass) {
        return {salt: salt, key: scrypt.crypto_scrypt(scrypt.encode_utf8(pass), salt, 16384, 8, 1, 32)};
    }
    // padding function; formats `bytes` as a netstring, appending 0-2048 random
    // bytes to the end to disguise length changes.
    function pad(bytes) {
        if (!(bytes instanceof Uint8Array)) {
            throw err("type", "nermal._pad() requires a Uint8Array.");
        }
        var pad_len = Math.floor(Math.random() * 2048),
            padding = rand(pad_len),
            netstr_prefix = scrypt.encode_utf8(bytes.length + ":"),
            padded = new Uint8Array(netstr_prefix.length + bytes.length + pad_len + 1);
        padded.set(netstr_prefix, 0);
        padded.set(bytes, netstr_prefix.length);
        padded[bytes.length + netstr_prefix.length] = 44; // comma
        padded.set(padding, netstr_prefix.length + bytes.length + 1);
        return padded;
    }
    // undo pad()
    function unpad(bytes) {
        var i = 0, str_n, end;
        while (bytes[i] !== ":".charCodeAt(0) && i < bytes.length) {
            i += 1;
        }
        try {
            str_n = scrypt.decode_utf8(bytes.subarray(0, i));
            if (i < bytes.length && /^(?:0|[1-9][0-9]*)$/.exec(str_n)) {
                end = i + 1 + parseInt(str_n, 10);
                if (end <= bytes.length) {
                    return bytes.subarray(i + 1, end);
                }
            }
        } catch (ignore) { }
        throw err("unpad", "Byte array was not formatted by nermal._pad()");
    }
    function getKey(box, password) {
        return kdf(b64.dec(box.split("\n")[1]), password);
    }
    function newKey(password) {
        return kdf(rand(30), password);
    }
    // throw descriptive errors when a value does not live up to our `bin` type expectation
    function sanitize_bin(role, val, proc_if_str, proc_if_undef) {
        if (typeof val === "string") {
            return proc_if_str(val);
        }
        if (val === undefined && proc_if_undef) {
            return proc_if_undef();
        }
        if (val instanceof Uint8Array) {
            return val;
        }
        throw err("type", "Parameter `" + role + "` was not a string or Uint8Array.");
    }

    // PUBLIC API
    api._b64 = b64;
    api._kdf = kdf;
    api._pad = pad;
    api._unpad = unpad;
    api.version = version;
    api.newKey = newKey;
    api.getKey = getKey;
    api.encrypt = function encrypt(ns, data, key, nonce) {
        if (typeof ns !== "string") {
            throw err("namespace", "Namespace was not a string.");
        }
        if (ns[0] === " ") {
            throw err("namespace", "Namespaces cannot begin with space characters.");
        }
        // we escape any special characters in the namespace with JSON.stringify():
        ns = ns === "" ? version : ns + "/" + version;
        var key_obj = typeof key === "string" ? newKey(key) : key,
            ba_key = ba_from_bytes(sanitize_bin("key", key_obj.key, b64.dec)),
            salt = sanitize_bin("salt", key_obj.salt, b64.dec);
        nonce = sanitize_bin("nonce", nonce, b64.dec, rand.bind(rand, 16));
        data = sanitize_bin("data", data, scrypt.encode_utf8);
        return JSON.stringify(ns).slice(1, -1) + "\n" + b64.enc(salt) + "\n" + b64.enc(nonce) + "\n" +
            sjcl.codec.base64.fromBits(sjcl.mode.gcm.encrypt(
                new sjcl.cipher.aes(ba_key),
                ba_from_bytes(pad(data)),
                ba_from_bytes(nonce),
                sjcl.codec.utf8String.toBits(ns),
                128
            )) + "\n";
    };
    api.decrypt = function decrypt(box, key, raw) {
        if (typeof box !== "string") {
            throw err("type", "Parameter `box` was not a string.");
        }
        key = typeof key === "string" ? getKey(box, key) : key;
        var obj = box.trim().split("\n").map(function (s) {
                return JSON.parse('"' + s.trim() + '"');
            }),
            ns = obj[0].split("/"),
            data;
        if (re_compatible.exec(ns[ns.length - 1]) === null) {
            throw err('incompatible', 'String does not report being a ' +
                version.slice(0, version.indexOf('.')) + '.x box.');
        }
        try {
            data = unpad(bytes_from_ba(sjcl.mode.gcm.decrypt(
                new sjcl.cipher.aes(ba_from_bytes(key.key)),
                sjcl.codec.base64.toBits(obj.slice(3).join("")), // ciphertext
                sjcl.codec.base64.toBits(obj[2]), // nonce
                sjcl.codec.utf8String.toBits(obj[0]), // ns
                128
            )));
        } catch (e) {
            throw err('decrypt', "Decryption error: " + e);
        }
        try {
            return raw === true ? data : sjcl.codec.utf8String.fromBits(ba_from_bytes(data));
        } catch (e) {
            throw err('utf8', "The wrapped bytes are not a UTF-8 formatted string.");
        }
    };
    return api;
}(typeof exports === "object" ? exports : {}));
