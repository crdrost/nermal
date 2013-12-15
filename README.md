# Nermal!
Nermal makes securing your JavaScript application's data much easier.

Nermal does private-key *authenticated encryption* with a trusted algorithm 
([AES-256][aes]/[GCM][gcm]) implemented by a trusted library ([SJCL][sjcl]) with
the best existent key-derivation system ([scrypt][scrypt]). It keeps track of
salts for its keys, and automatically generates random nonces. It also pads the
data with a random number of random bytes, which makes it harder to determine
what sort of operations are being performed on the data.

Authenticated encryption basically means that when you decrypt the data, you can
be confident that it's something which you encrypted, in the format that you
encrypted it in. Nermal also authenticates and stores a *namespace string*, so
that there is a nice place for you to store version numbers so that you can
reorganize your data format later. 

Nermal boxes are newline-separated ASCII strings<sup>[note 1]</sup>, so you can
save them to disk or transmit them as JSON or whatever you want, interoperably.

# Installation
Nermal was written to be interoperable with [Node.js][node], but also to work
client-side in the browser. To use with node:

    npm install nermal

To use with the browser, you will need to load the files for [SJCL][sjcl] and
[scrypt][scrypt] in your HTML file first, then include `nermal.js` with a 
script tag -- it will initialize `scrypt` for you. I may eventually release a
packed version which contains all of the source for the browser.

# Usage
Nermal has a minimalist API. A nermal box is ultimately just a JavaScript 
string and can be transmitted or stored easily as as such. Nermal
only encrypts JavaScript strings and [Uint8Array][uint8]s, leaving questions of
how your data is serialized to you. Other than putting data into/out of the box
with `encrypt` and `decrypt`, nermal provides `newKey` and `getKey` for
applications which want to manage keys (so that you don't have to wait for
scrypt twice), and some developer functions are exposed with leading
underscores.

Full docs are available in `nermal/API.md`. The types and argument orders of the
most common functions are:

    encrypt: (ns: string, data: $bin, key: string | $key, nonce: $bin?) -> $nermal_box!
    decrypt: (box: $nermal_box, key: string | $key, raw: boolean?) -> $bin
    newKey:  (pass: string) -> $key!
    getKey:  (box: $nermal_box, pass: string) -> $key
    version: string

# Notes
1.  This is not quite true: nermal never *adds* non-ASCII characters but the 
    namespace of a nermal box may contain non-ASCII characters. Nermal only
    forbids namespaces containing leading spaces, for embeddability reasons.
    However, nermal serializes namespaces with `JSON.stringify(ns).slice(1, -1)`
    so that you don't have to worry about, say, control characters in the
    resulting string.

[aes]:  https://en.wikipedia.org/wiki/Advanced_Encryption_Standard "Advanced Encryption Standard"
[gcm]:  https://en.wikipedia.org/wiki/Galois/Counter_Mode          "Galois/Counter Mode"
[sjcl]: https://github.com/bitwiseshiftleft/sjcl                   "Stanford JavaScript Crypto Library"
[scrypt]: https://github.com/tonyg/js-scrypt                       "Emscripten-compiled scrypt"
[node]: http://nodejs.org/                                         "node.js"
[uint8]: https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array "Uint8Array - Web API interfaces | MDN"
