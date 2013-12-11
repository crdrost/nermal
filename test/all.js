var sjcl, scrypt, nermal;

sjcl = require('sjcl');
scrypt = require('js-scrypt-em');
nermal = require('./nermal.js');

// sjcl doesn't have a native bytes interpreter?
function ba_from_bytes(bytes) {
    return sjcl.codec.base64.toBits(bytes.toString('base64'));
}

function makeTest(str_plaintext, str_pass, b64_salt, b64_nonce) {
    var prefix = "test/" + nermal.version,
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

var test_string = makeTest(
    "29:This text should be returned. This text shouldn't; it should be discarded as random padding.",
    "Let me in!",
    "Sodium+Chloride",
    "Some+nonce+of+16+bytes==");

exports['encryption/decryption done properly'] = function (assert) {
    assert.equal(test_string, "test/" + nermal.version + "\nSodium+Chloride\nSome+nonce+of+16+bytes==\n\
CWD4rIQnh0VPLCyIcSXg8C4dlg1kOBMf/9nYCnx2ZcAGG87d9S/1pxlRUw5fJOBp9KphrTjNCU0iqRvA2nly9YXCxw8T3PSpe+txkdiccROYGg8Ni3zJpJu32xezIZ1hHShTpRrWhS/T4VYsiR5W");
    // assert.equal(nermal.decrypt(test_string, "Let me in!", true), "This text should be returned.");
    
};
/*
exports['decryption done properly'] = function (assert) {
};
*/