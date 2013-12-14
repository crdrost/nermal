var sjcl = require('sjcl'), scrypt = require('js-scrypt-em'), n = require('./nermal.js');

(function () {
    "use strict";
    function makeTest(str_plaintext, str_pass, b64_salt, b64_nonce) {
        function ba_from_bytes(bytes) {
            return sjcl.codec.base64.toBits(bytes.toString('base64'));
        }
        var prefix = "test/" + n.version,
            ba_pre = sjcl.codec.utf8String.toBits(prefix),
            ba_text = ba_from_bytes(new Buffer(str_plaintext, 'utf8')),
            ba_nonce = sjcl.codec.base64.toBits(b64_nonce),
            ba_key = ba_from_bytes(new Buffer(scrypt.crypto_scrypt(
                    scrypt.encode_utf8(str_pass),
                    new Buffer(b64_salt, 'base64'),
                    16384, 8, 1, 32
            )));
        return prefix + "\n" + b64_salt + "\n" + b64_nonce + "\n" + sjcl.codec.base64.fromBits(
            sjcl.mode.gcm.encrypt(new sjcl.cipher.aes(ba_key), ba_text, ba_nonce, ba_pre, 128)
        );
    }
    function test(title, fn) {
        var out;
        try {
            out = fn();
            switch (out) {
            case true:
                return console.log(title + ": passed.");
            default:
                console.log(title + ": failed implicitly: \n    " + JSON.stringify(out));
                throw new Error("Test failed.");
            }
        } catch (e) {
            console.log(title + ": failed with Error:");
            throw e;
        }
    }
    function should_fail(fn) {
        return function () {
            try {
                return ["should have failed, instead returned: ", fn()];
            } catch (ignored) {
                return true;
            }
        };
    }
    function yields(x, fn) {
        return function () {
            var out = fn();
            return out === x ? true : ["Not equal: ", x, out];
        };
    }
    function yieldsBytes(arr, fn) {
        return function () {
            var out = fn();
            if (!out instanceof Uint8Array) {
                return ["Not Uint8Array: ", out];
            }
            return arr.reduce(function (acc, x, i) { return acc && x === out[i]; }, true) ?
                true : ["not equal: ", out, arr];
        };
    }
    function throughCrypt(vals) {
        vals = vals instanceof Array ? new Uint8Array(vals) : vals;
        return function () { return n.decrypt(n.encrypt("test", vals, key), key, true); };
    }

    var i, tmp, crypto = require('crypto'), key = n.newKey("Key used in testing."),
        hello_world = "hello/nermal 1.0.0\nH80+LXT55CZpMcZkvzDaXfN4a1HkkOwy/uY3iAX0\nnPec36S+MrB9uixN8oxw1A==\nKrgoaAHrZwmdAnusIbFlpk+o5mo9EE2cD20/YT2b1vs34m+NTIzkzXKhmROV2huun6wbhis+FuEhZYxgwkN4cM0YXqQx7i6ByBzGQQuaPwGTH63li++nC5Jz6n6UouDE1cCw++NqDMqcB+mUFBTsgpwHdBtYOPa7ox8Pr4bw/jAhlfWbNGnookW3fI/jxtWEyDPdcmtmXtFfq/Xi0MSlupxw03FZIiczueHamzw4JuCSSESeEBktM/dK/CVQIpPGF0B29UDnNh1P2Ytex32/YlAGriiUEkFMhpQPrpw4DHRF9T52vRpMyzTcX4GqchsC7ZoOJhSzPLV6fX0jBaLWD4fLsqa9pUD4UWqwrvyyA2uXac2cbg/7GFVuDUj/2QYyVgfERSp+t6imJf+b+M5H95VL1UL2ggrQyXhQvrnC9zCppRX5taTsMCm9KjtNgI5UIsWQEzh7CkImflDI+YMTRvkj0J61eMe90MFyI/HEguXUCTstVlSubaFufJT4rbXJxcpoPgA1S9FeUA9Fwr9N2E1R2xnPc2Gnlr+D/PTqe7IALHMtadstM0b+HVMQvaYzeHseUtFdWp/Vz07WMx/AoGgeDdxU3bv4drjzjNGCrO/6q6aXHpMZwWn/9hfhENIEU8cHratE7YDk+80f+VNdsPhDb8EsyuS+yuihtJhHsByLqgoeIeBx4lfiVGBlQ8xd2cocXe+4pelrk+cBQr5uSlJ3D9NDKFkN4iJf5NtaGtAVcaWD5f9Ia7Jg5AX20JMnp4oklvKM9CQiyWqvFj9vPLNdO3yyS9w8VNaSMX3aDHsCgrLX3cbkiwMr2V+RJhB5YWSTsMzdr0G9rHuNKGn/R6lpRC0BGVS+rS4ojZqVZcIgZuqZinO7YoRljiFvlZskk/9hnpWDNl/kYDlKeSoZqysOMEOkkZO6oS5ziR7MGZiVjRCwwCjRpVWJNoY9ck4bLkYRXSxNuOTSkfW+WF1CTP5VTO8nACUr9zQMG/mkCggCmfSQI8teSJomSK4zN+4AuZ9Ls2Jn4cU1e8PONkU2QGFwO9D4N/iKF85H5ljTYSqkRLmTuwWcOdty5Zl9x1pUd8n4/vUmP3bLrwQ6oNyAP5lZ+nMhYWgjT7g4+JAfDoVWnI06GHVezSTVJjEKOjZsUj7GFMD1lPhuy3gL4czBtE+dDK7Jueb/ScH6Fozk8vA8N4AFlrJNALF96jnTMKiNqjUsQ9Y0Ark55jrsItJMJHo2IMXULtpQVVOsqmUSRxQi9KVxUCT166n1YzxaapFH5tyvpcKARffR5jlP9UpfhK3dmh8mVJiW7yJcleTrBRfBeUf6FGDai81EJlXR9+drPJVCBfRmON+t4AhRX7+Vc/feOJJcvSO3\n",
        test_string = makeTest(
            "29:This text should be returned. This text shouldn't; it should be discarded as random padding.",
            "Let me in!",
            "Sodium+Chloride",
            "Some+nonce+of+16+bytes==");

    test("decrypt (right key) 1", yields("Hello, World!", n.decrypt.bind(n, hello_world, "password1")));
    test("decrypt (right key) 2", yields("This text should be returned.", n.decrypt.bind(n, test_string, "Let me in!")));
    test("decrypt (wrong key) 1", should_fail(n.decrypt.bind(n, test_string, "password1")));
    test("decrypt (wrong key) 2", should_fail(n.decrypt.bind(n, hello_world, "Let me in!")));

    test("encrypt (zero bytes)", yieldsBytes([], throughCrypt([])));
    for (i = 1; i < 1024; i *= 2) {
        tmp = Array.prototype.slice.call(crypto.pseudoRandomBytes(i));
        test("encrypt (" + i + " bytes)", yieldsBytes(tmp, throughCrypt(tmp)));
    }
    test("blank namespaces", yields('nermal ', function () {
        return n.encrypt("", "data", key).slice(0, 7);
    }));
    console.log("All tests OK.");
}());