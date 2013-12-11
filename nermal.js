

function unpad(bytes) {
    var i = 0, n;
    while (bytes[i] !== ":".charCodeAt(0)) {
        i += 1;
    }
    n = parseInt(scrypt.decode_utf8(bytes.subarray(0, i)), 10);
    return bytes.subarray(i + 1, i + 1 + n);
}
exports.version = "nermal 0.0.0";
exports.decrypt = function decrypt(box, password) {
    throw new Error("Not yet implemented");
};