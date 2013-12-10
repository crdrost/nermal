# Nermal!
Nermal makes securing your JavaScript application's data much easier.

Nermal does private-key *authenticated encryption* with a trusted algorithm 
([AES-256][aes]/[GCM][gcm]) implemented by a trusted library ([SJCL][sjcl]) with
the best existent key-derivation system ([scrypt][scrypt]). It keeps track of
salts for its keys, and automatically generates random nonces. It also pads the
data with a random number of random bytes, which makes it much harder to
determine what sort of operations are being performed on the data.

Authenticated encryption basically means that when you decrypt the data, you can
be confident that it's something which you encrypted, in the format that you
encrypted it in. Nermal will also authenticate and store a *namespace string*,
which means that there is a nice place to store version numbers so that you can
reorganize your data format later.

Nermal was written to be interoperable with [Node.js][node], but also to work
client-side in the browser. 

It does all of this while exposing a minimalist API. A nermal container ("box")
is ultimately just an ASCII string and can be transmitted as such. Nermal only
encrypts JavaScript strings and [Uint8Array][uint8]s, leaving questions of how 
your data is serialized to you. Other than putting data into/out of the box 
with `encrypt` and `decrypt`, nermal provides `newKey` and `getKey` for 
applications which want to manage keys (so that you don't have to wait for 
scrypt twice), and that's it. 

Finally, nermal is open-source. All of the components of nermal, as well as 
nermal itself, are licensed under a 2-clause BSD license. You can use them
without fear of us suing you, and you also may not sue us.

[aes]:  https://en.wikipedia.org/wiki/Advanced_Encryption_Standard "Advanced Encryption Standard"
[gcm]:  https://en.wikipedia.org/wiki/Galois/Counter_Mode          "Galois/Counter Mode"
[sjcl]: https://github.com/bitwiseshiftleft/sjcl                   "Stanford JavaScript Crypto Library"
[scrypt]: https://github.com/tonyg/js-scrypt                       "Emscripten-compiled scrypt"
[node]: http://nodejs.org/                                         "node.js"
[uint8]: https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array "Uint8Array - Web API interfaces | MDN"
