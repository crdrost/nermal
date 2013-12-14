# The nermal API

Nermal provides encrypted JavaScript string containers using Base64 to encode
the encrypted data. The containers are protected with AES-256-GCM, which is an
*authenticated mode*: this means that there is a checksum which provides a
cryptographic assurance that the data has been decrypted successfully. The 
containers are also padded with 0-2 KiB of random data to disguise small changes
in length.

Related projects: This library was basically needed because there was no good 
authenticated encryption method which worked both in newer browsers and in 
node.js; but an important similar project is [js-NaCl][js-nacl], which can also 
provide asymmetric (public key) encryption and decryption as well. (I had 
trouble with inconsistencies in js-NaCl which is why I'm using SJCL here.) If
you are not looking to securely store and transmit data, but rather want to do
secure logins, you should examine Mozilla's [node-SRP][node-srp].

For installation, `npm install nermal` should work for node; for the browser you
must install the script files from [js-scrypt][js-scrypt] and [sjcl][sjcl].
Right now the Base64 library in browsers is provided by `atob()` and `btoa()`
which are supported by Chrome, Firefox, Safari, Opera, and IE 10, but not 
earlier versions of IE.

[js-nacl]: https://github.com/tonyg/js-nacl "Emscripten-compiled Javascript version of NaCl"
[js-scrypt]: https://github.com/tonyg/js-scrypt  "Emscripten-compiled scrypt"
[node-srp]: https://github.com/mozilla/node-srp "Secure Remote Password for Node.js"
[sjcl]: https://github.com/bitwiseshiftleft/sjcl "Stanford JavaScript Cryptography Library"

## Type notes
This document uses a particular type description system inspired by Haskell but
adapted for use in JavaScript. Names starting with lowercase are JavaScript
types (as given by `typeof`; names starting with uppercase refer to JavaScript
classes (checkable by `instanceof`); names starting with a special character are
defined herein. The type combinator `<x> | <y>` accepts either of the two
subtypes; `<x>?` is shorthand for `undefined | <x>`. The type suffix `<x>!`
is similar to one function of Haskell's `IO x` type: it means that a function
will return something of type `<x>`, but two invocations of the same function on
the same parameters will return different values of that type.

Functions are written `(<name>: <type>, ...) -> <output_type>`; even though the
names are not formally necessary they're here for clarity. The object type
`{<key>: <type>, ...}` matches an object with those keys having those types.

# The nermal namespace
This is the nermal namespace in summary:

    $bin = string | Uint8Array
    $nermal_box = string
    $key = {key: Uint8Array, salt: Uint8Array}

    nermal: {
        encrypt: (ns: string, data: $bin, key: string | $key, nonce: $bin?) -> $nermal_box!
        decrypt: (box: $nermal_box, key: string | $key, raw: boolean?) -> $bin
        newKey:  (pass: string) -> $key!
        getKey:  (box: $nermal_box, pass: string) -> $key
        version: string
        _kdf:    (salt: Uint8Array, pass: string) -> $key
        _pad:    (bytes: Uint8Array) -> Uint8Array!
        _unpad:  (bytes: Uint8Array) -> Uint8Array
        _b64:    {
            enc: (arr: Uint8Array) -> string
            dec: (str: string) -> Uint8Array
        }
    }

The `$bin` type alias means that you may provide either a string or a Uint8Array
of binary data. The `$nermal_box` type is a specially-formatted string
containing a namespace, salt, nonce, and encrypted bytes. The `$key` type is
provided for applications which want to do key management.

## Public API
This API provides those functions which can reasonably be expected to be stable.

### version

    version: string

A copy of the version string of nermal that is appended to namespaces.

### encrypt

    encrypt: (ns: string, data: $bin, key: string | $key, nonce: $bin?) -> $nermal_box!

Encrypts `data` under `key` and `nonce` after padding it with `_pad`.

When `key` is a string it is assumed to be a new password and processed with
`newKey`. When `data` is a string it is UTF-8 encoded. When the nonce is not
specified it is randomly generated; when it is specified as a string it is
Base64-decoded.

### decrypt

    decrypt: (box: $nermal_box, key: string | $key, raw: boolean?) -> $bin

Attempt to decrypt the `box` via the `key`; throws an error if this is
impossible.

As with `encrypt`, when `key` is a string it is assumed to be a password and
processed with `getKey`. When `raw` is present and `true`, the data is returned
as a `Uint8Array`, otherwise the data is decoded with UTF-8 and returned as a
`string`.

### newKey

    newKey: (pass: string) -> $key!

Derive a new key with `_kdf`, a new 240-bit random salt, and `pass`.

### getKey

    getKey: (box: $nermal_box, pass: string) -> $key

Derive the corresponding key with `_kdf`, the salt from the box, and `pass`.

## Developer API
Developers may on occasion need access to the underlying components of nermal.
These are exposed with underscores and may change in the future.

### _kdf

    _kdf: (salt: Uint8Array, pass: string) -> $key

Derive a 256-bit key given a salt and password. This is presently implemented as:
    
    scrypt.crypto_scrypt(scrypt.encode_utf8(pass), salt, 16384, 8, 1, 32);

### _pad

    _pad:    (bytes: Uint8Array) -> Uint8Array!

Pad the byte array by formatting it as a netstring and then appending some
random number (0 - 2048) of random bytes.

### _unpad

    _unpad:  (bytes: Uint8Array) -> Uint8Array

Unpad a byte array in the format produced by _pad(). Throw errors if `bytes` is
not in that format.

### _b64

    _b64: {enc: (arr: Uint8Array) -> string, dec: (str: string) -> Uint8Array}

Namespace exposing the base64 functions used by nermal.