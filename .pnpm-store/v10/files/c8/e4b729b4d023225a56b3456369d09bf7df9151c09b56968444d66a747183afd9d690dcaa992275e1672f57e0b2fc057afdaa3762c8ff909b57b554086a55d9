// src/lib.ts
import * as bcu from "bigint-crypto-utils";
import sodium from "libsodium-wrappers-sumo";
import * as paillierBigint from "paillier-bigint";
var _PLAINTEXT_SIGNED_INTEGER_MIN = BigInt(-2147483648);
var _PLAINTEXT_SIGNED_INTEGER_MAX = BigInt(2147483647);
var _SECRET_SHARED_SIGNED_INTEGER_MODULUS = 2n ** 32n + 15n;
var _PLAINTEXT_STRING_BUFFER_LEN_MAX = 4096;
function getCrypto() {
  if (!globalThis.crypto) {
    throw new Error("Crypto web-api not available but required");
  }
  return globalThis.crypto;
}
function _mod(n, m) {
  return ((n < 0 ? n + m : n) % m + m) % m;
}
function _xor(a, b) {
  const length = Math.min(a.length, b.length);
  const r = Buffer.alloc(length);
  for (let i = 0; i < length; i++) {
    r[i] = a[i] ^ b[i];
  }
  return r;
}
function _concat(a, b) {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}
function _equalKeys(a, b) {
  const zip = (a2, b2) => a2.map((k, i) => [k, b2[i]]);
  return zip(a, b).every((pair) => pair[0] === pair[1]);
}
async function _sha512(bytes) {
  const buffer = await getCrypto().subtle.digest("SHA-512", bytes);
  return new Uint8Array(buffer);
}
async function _randomBytes(length, seed = null, salt = null) {
  await sodium.ready;
  if (seed !== null) {
    try {
      const info = new Uint8Array(0);
      return await hkdfDerive(seed, salt, info, length);
    } catch (error) {
      throw new Error(`Failed to derive key: ${error}`);
    }
  }
  return sodium.randombytes_buf(length);
}
async function _randomInteger(minimum, maximum, seed = null) {
  if (minimum < 0 || minimum > 1) {
    throw new RangeError("minimum must be 0 or 1");
  }
  if (maximum <= minimum || maximum >= _SECRET_SHARED_SIGNED_INTEGER_MODULUS) {
    throw new RangeError(
      "maximum must be greater than the minimum and less than the modulus"
    );
  }
  const range = maximum - minimum;
  let integer = null;
  let index = 0n;
  while (integer === null || integer > range) {
    const index_bytes = Buffer.alloc(8);
    index_bytes.writeBigInt64LE(index, 0);
    const uint8Array = await _randomBytes(8, seed, index_bytes);
    index++;
    uint8Array[4] &= 1;
    uint8Array[5] &= 0;
    uint8Array[6] &= 0;
    uint8Array[7] &= 0;
    const buffer = Buffer.from(uint8Array);
    const small = BigInt(buffer.readUInt32LE(0));
    const large = BigInt(buffer.readUInt32LE(4));
    integer = small + large * 2n ** 32n;
  }
  return minimum + integer;
}
function _shamirsEval(poly, x, prime) {
  let accum = BigInt(0);
  for (let i = poly.length - 1; i >= 0; i--) {
    accum = (_mod(accum * x, prime) + poly[i]) % prime;
  }
  return accum;
}
async function _shamirsShares(secret, totalShares, minimumShares, prime) {
  if (minimumShares > totalShares) {
    throw new Error("Minimum shares required must be less than total shares.");
  }
  const poly = [secret];
  for (let i = 1; i < minimumShares; i++) {
    poly.push(await _randomInteger(1n, prime - 1n));
  }
  const points = [];
  for (let i = 1; i <= totalShares; i++) {
    const x = BigInt(i);
    const y = _shamirsEval(poly, x, prime);
    points.push([x, y]);
  }
  return points;
}
function _shamirsRecover(shares, prime) {
  let secret = 0n;
  for (let i = 0; i < shares.length; i++) {
    let num = 1n;
    let denom = 1n;
    for (let j = 0; j < shares.length; j++) {
      if (i !== j) {
        num = _mod(num * -shares[j][0], prime);
        denom = _mod(denom * (shares[i][0] - shares[j][0]), prime);
      }
    }
    const invDenom = bcu.modInv(denom, prime);
    secret = _mod(secret + shares[i][1] * num * invDenom, prime);
  }
  return secret;
}
function shamirsAdd(shares1, shares2) {
  if (shares1.length !== shares2.length) {
    throw new Error("Shares sets must have the same length.");
  }
  return shares1.map(([x1, y1], index) => {
    const [x2, y2] = shares2[index];
    if (x1 !== x2) {
      throw new Error("Mismatched x-values in shares.");
    }
    return [
      x1,
      Number(
        _mod(
          BigInt(y1) + BigInt(y2),
          BigInt(_SECRET_SHARED_SIGNED_INTEGER_MODULUS)
        )
      )
    ];
  });
}
function _pack(b) {
  return Buffer.from(b).toString("base64");
}
function _unpack(s) {
  return new Uint8Array(Buffer.from(s, "base64"));
}
function _encode(value) {
  let bytes;
  if (typeof value === "bigint") {
    const buffer = Buffer.alloc(9);
    buffer[0] = 0;
    buffer.writeBigInt64LE(value, 1);
    bytes = new Uint8Array(buffer);
  } else if (value instanceof Uint8Array) {
    const byte = new Uint8Array([2]);
    bytes = _concat(byte, value);
  } else {
    bytes = new TextEncoder().encode(value);
    const byte = new Uint8Array([1]);
    bytes = _concat(byte, bytes);
  }
  return bytes;
}
function _decode(bytes) {
  if (bytes[0] === 0) {
    return Buffer.from(bytes).readBigInt64LE(1);
  }
  if (bytes[0] === 2) {
    return new Uint8Array(bytes.subarray(1));
  }
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(Buffer.from(bytes.subarray(1)));
}
var SecretKey = class _SecretKey {
  material;
  cluster;
  operations;
  threshold;
  constructor(cluster, operations) {
    if (cluster.nodes === void 0 || cluster.nodes.length < 1) {
      throw new TypeError(
        "cluster configuration must contain at least one node"
      );
    }
    if (Object.keys(operations).length !== 1 || !operations.store && !operations.match && !operations.sum) {
      throw new TypeError(
        "operation specification must enable exactly one operation"
      );
    }
    this.material = {};
    this.cluster = cluster;
    this.operations = operations;
  }
  /**
   * Return a secret key built according to what is specified in the supplied
   * cluster configuration and operation specification.
   */
  static async generate(cluster, operations, threshold = null, seed = null) {
    await sodium.ready;
    const seedBytes = seed === null ? null : typeof seed === "string" ? new TextEncoder().encode(seed) : new Uint8Array(seed);
    const secretKey = new _SecretKey(cluster, operations);
    if (secretKey.operations.store) {
      secretKey.material = await _randomBytes(
        sodium.crypto_secretbox_KEYBYTES,
        seedBytes
      );
    }
    if (secretKey.operations.match) {
      secretKey.material = await _randomBytes(64, seedBytes);
    }
    if (secretKey.operations.sum) {
      if (secretKey.cluster.nodes.length === 1) {
        if (seed !== null) {
          throw Error(
            "seed-based derivation of summation-compatible keys is not supported for single-node clusters"
          );
        }
        const { privateKey } = await paillierBigint.generateRandomKeys(2048);
        secretKey.material = privateKey;
      } else {
        secretKey.material = [];
        for (let i = 0n; i < secretKey.cluster.nodes.length; i++) {
          const indexBytes = Buffer.alloc(8);
          indexBytes.writeBigInt64LE(i, 0);
          secretKey.material.push(
            Number(
              await _randomInteger(
                1n,
                _SECRET_SHARED_SIGNED_INTEGER_MODULUS - 1n,
                await _randomBytes(64, seedBytes, indexBytes)
              )
            )
          );
        }
      }
    }
    if (threshold !== null) {
      if (!Number.isInteger(threshold) || threshold < 1 || threshold > cluster.nodes.length) {
        throw new Error(
          "threshold must be a positive integer not larger than the cluster size"
        );
      }
      if (!operations.sum) {
        throw new Error("thresholds are only supported for the sum operation");
      }
      secretKey.threshold = threshold;
    }
    return secretKey;
  }
  /**
   * Return a JSON-compatible object representation of this key instance.
   */
  dump() {
    const object = {
      material: {},
      cluster: this.cluster,
      operations: this.operations
    };
    if (Array.isArray(this.material) && this.material.every((o) => typeof o === "number")) {
      object.material = this.material;
    } else if (this.material instanceof Uint8Array) {
      object.material = _pack(this.material);
    } else {
      const privateKey = this.material;
      object.material = {
        n: privateKey.publicKey.n.toString(),
        g: privateKey.publicKey.g.toString(),
        l: privateKey.lambda.toString(),
        m: privateKey.mu.toString()
      };
    }
    if (this.threshold !== void 0) {
      object.threshold = this.threshold;
    }
    return object;
  }
  /**
   * Return an instance built from a JSON-compatible object representation.
   */
  static load(object) {
    const errorInvalid = new TypeError(
      "invalid object representation of a secret key"
    );
    if (!("material" in object && "cluster" in object && "operations" in object)) {
      throw errorInvalid;
    }
    const secretKey = new _SecretKey(
      object.cluster,
      object.operations
    );
    if (Array.isArray(object.material) && object.material.every((o) => typeof o === "number")) {
      secretKey.material = object.material;
    } else if (typeof object.material === "string") {
      secretKey.material = _unpack(object.material);
    } else {
      const material = object.material;
      if (!("l" in material && "m" in material && "n" in material && "g" in material)) {
        throw errorInvalid;
      }
      if (!(typeof material.l === "string" && typeof material.m === "string" && typeof material.n === "string" && typeof material.g === "string")) {
        throw errorInvalid;
      }
      secretKey.material = new paillierBigint.PrivateKey(
        BigInt(material.l),
        BigInt(material.m),
        new paillierBigint.PublicKey(
          BigInt(material.n),
          BigInt(material.g)
        )
      );
    }
    if ("threshold" in object) {
      secretKey.threshold = object.threshold;
    }
    return secretKey;
  }
};
var ClusterKey = class _ClusterKey extends SecretKey {
  constructor(cluster, operations, threshold = void 0) {
    super(cluster, operations);
    if (cluster.nodes.length < 2) {
      throw new TypeError(
        "cluster configuration must contain at least two nodes"
      );
    }
    delete this.material;
    this.cluster = cluster;
    this.operations = operations;
    this.threshold = threshold;
  }
  /**
   * Return a cluster key built according to what is specified in the supplied
   * cluster configuration and operation specification.
   */
  static async generate(cluster, operations, threshold = void 0) {
    if (threshold !== void 0) {
      if (!Number.isInteger(threshold) || threshold < 1 || threshold > cluster.nodes.length) {
        throw new Error(
          "threshold must be a positive integer not larger than the cluster size"
        );
      }
      if (!operations.sum) {
        throw new Error("thresholds are only supported for the sum operation");
      }
    }
    return new _ClusterKey(cluster, operations, threshold);
  }
  /**
   * Return a JSON-compatible object representation of this key instance.
   */
  dump() {
    return {
      material: {},
      // ClusterKey does not use material, but it's required by the base class
      cluster: this.cluster,
      operations: this.operations,
      threshold: this.threshold
    };
  }
  /**
   * Return an instance built from a JSON-compatible object representation.
   */
  static load(object) {
    if (!("cluster" in object && "operations" in object)) {
      throw new TypeError("invalid object representation of a cluster key");
    }
    return new _ClusterKey(
      object.cluster,
      object.operations,
      "threshold" in object ? object.threshold : void 0
    );
  }
};
var PublicKey2 = class _PublicKey {
  material;
  cluster;
  operations;
  constructor(secretKey) {
    this.cluster = secretKey.cluster;
    this.operations = secretKey.operations;
    if (typeof secretKey.material === "object" && "publicKey" in secretKey.material && secretKey.material.publicKey instanceof paillierBigint.PublicKey) {
      this.material = secretKey.material.publicKey;
    } else {
      throw new TypeError("cannot create public key for supplied secret key");
    }
  }
  /**
   * Return a public key built according to what is specified in the supplied
   * secret key.
   */
  static async generate(secretKey) {
    return new _PublicKey(secretKey);
  }
  /**
   * Return a JSON-compatible object representation of this key instance.
   */
  dump() {
    const object = {
      material: {},
      cluster: this.cluster,
      operations: this.operations
    };
    if (typeof this.material === "object" && "n" in this.material && "g" in this.material) {
      const publicKey = this.material;
      object.material = {
        n: publicKey.n.toString(),
        g: publicKey.g.toString()
      };
    }
    return object;
  }
  /**
   * Return an instance built from a JSON-compatible object representation.
   */
  static load(object) {
    const errorInvalid = new TypeError(
      "invalid object representation of a public key"
    );
    if (!("material" in object && "cluster" in object && "operations" in object)) {
      throw errorInvalid;
    }
    const publicKey = {};
    publicKey.cluster = object.cluster;
    publicKey.operations = object.operations;
    const material = object.material;
    if (!("n" in material && "g" in material)) {
      throw errorInvalid;
    }
    if (!(typeof material.n === "string" && typeof material.g === "string")) {
      throw errorInvalid;
    }
    publicKey.material = new paillierBigint.PublicKey(
      BigInt(material.n),
      BigInt(material.g)
    );
    return publicKey;
  }
};
async function hkdfDerive(ikm, salt, info, length) {
  const defaultSalt = new Uint8Array([0]);
  const hmacSalt = salt || defaultSalt;
  const key = await getCrypto().subtle.importKey(
    "raw",
    hmacSalt,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const prk = new Uint8Array(await getCrypto().subtle.sign("HMAC", key, ikm));
  const N = Math.ceil(length / 64);
  const T = new Uint8Array(N * 64);
  let lastT = new Uint8Array(0);
  for (let i = 0; i < N; i++) {
    const hmacKey = await getCrypto().subtle.importKey(
      "raw",
      prk,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const input = new Uint8Array(lastT.length + info.length + 1);
    input.set(lastT);
    input.set(info, lastT.length);
    input[input.length - 1] = i + 1;
    lastT = new Uint8Array(
      await getCrypto().subtle.sign("HMAC", hmacKey, input)
    );
    T.set(lastT, i * 64);
  }
  return T.slice(0, length);
}
async function encrypt(key, plaintext) {
  await sodium.ready;
  const error = new Error(
    "cannot encrypt the supplied plaintext using the supplied key"
  );
  let buffer = Buffer.from(new Uint8Array());
  let bigInt = 0n;
  if (typeof plaintext === "number" || typeof plaintext === "bigint") {
    bigInt = typeof plaintext === "number" ? BigInt(Number(plaintext)) : plaintext;
    buffer = Buffer.from(_encode(bigInt));
    if (bigInt < _PLAINTEXT_SIGNED_INTEGER_MIN || bigInt > _PLAINTEXT_SIGNED_INTEGER_MAX) {
      throw new TypeError(
        "numeric plaintext must be a valid 32-bit signed integer"
      );
    }
  } else {
    buffer = Buffer.from(_encode(plaintext));
    if (buffer.length > _PLAINTEXT_STRING_BUFFER_LEN_MAX) {
      const len = _PLAINTEXT_STRING_BUFFER_LEN_MAX;
      throw new TypeError(
        `plaintext must be possible to encode in ${len} bytes or fewer`
      );
    }
  }
  if (key.operations.store) {
    const secretKey = key;
    let optionalEncrypt = (uint8Array) => uint8Array;
    if ("material" in secretKey) {
      const symmetricKey = secretKey.material;
      optionalEncrypt = (uint8Array) => {
        try {
          const nonce = sodium.randombytes_buf(
            sodium.crypto_secretbox_NONCEBYTES
          );
          return _concat(
            nonce,
            sodium.crypto_secretbox_easy(uint8Array, nonce, symmetricKey)
          );
        } catch (_) {
          throw error;
        }
      };
    }
    if (key.cluster.nodes.length === 1) {
      return _pack(optionalEncrypt(new Uint8Array(buffer)));
    }
    const shares = [];
    let aggregate = Buffer.alloc(buffer.length, 0);
    for (let i = 0; i < key.cluster.nodes.length - 1; i++) {
      const mask = Buffer.from(sodium.randombytes_buf(buffer.length));
      aggregate = _xor(aggregate, mask);
      shares.push(optionalEncrypt(mask));
    }
    shares.push(optionalEncrypt(_xor(aggregate, buffer)));
    return shares.map(_pack);
  }
  if (key.operations.match) {
    const secretKey = key;
    const hashed = await _sha512(
      _concat(secretKey.material, new Uint8Array(buffer))
    );
    const ciphertext = _pack(hashed);
    if (key.cluster.nodes.length > 1) {
      return key.cluster.nodes.map((_) => ciphertext);
    }
    return ciphertext;
  }
  if (key.operations.sum) {
    if (key.cluster.nodes.length === 1) {
      let paillierPublicKey;
      if ("publicKey" in key.material) {
        paillierPublicKey = key.material.publicKey;
      } else {
        paillierPublicKey = key.material;
      }
      return paillierPublicKey.encrypt(bigInt - _PLAINTEXT_SIGNED_INTEGER_MIN).toString(16);
    }
    const keyMultipleNodes = key;
    if (keyMultipleNodes.threshold === void 0) {
      const masks2 = "material" in key ? key.material.map(BigInt) : key.cluster.nodes.map((_) => 1n);
      const shares2 = [];
      let total = BigInt(0);
      const quantity = keyMultipleNodes.cluster.nodes.length;
      for (let i = 0; i < quantity - 1; i++) {
        const share = await _randomInteger(
          0n,
          _SECRET_SHARED_SIGNED_INTEGER_MODULUS - 1n
        );
        shares2.push(
          _mod(masks2[i] * share, _SECRET_SHARED_SIGNED_INTEGER_MODULUS)
        );
        total = _mod(total + share, _SECRET_SHARED_SIGNED_INTEGER_MODULUS);
      }
      shares2.push(
        _mod(
          _mod(bigInt - total, _SECRET_SHARED_SIGNED_INTEGER_MODULUS) * BigInt(masks2[quantity - 1]),
          _SECRET_SHARED_SIGNED_INTEGER_MODULUS
        )
      );
      return shares2.map(Number);
    }
    let shares = await _shamirsShares(
      bigInt,
      keyMultipleNodes.cluster.nodes.length,
      keyMultipleNodes.threshold,
      _SECRET_SHARED_SIGNED_INTEGER_MODULUS
    );
    const masks = "material" in key ? key.material.map(BigInt) : key.cluster.nodes.map((_) => 1n);
    shares = shares.map(([x, y], i) => [
      x,
      _mod(y * masks[i], _SECRET_SHARED_SIGNED_INTEGER_MODULUS)
    ]);
    return shares.map(([x, y]) => [Number(x), Number(y)]);
  }
  throw error;
}
async function decrypt(secretKey, ciphertext) {
  await sodium.ready;
  const error = new TypeError(
    "cannot decrypt the supplied ciphertext using the supplied key"
  );
  if (secretKey.cluster.nodes.length === 1) {
    if (typeof ciphertext !== "string") {
      throw new TypeError(
        "secret key requires a valid ciphertext from a single-node cluster"
      );
    }
  } else {
    if (!Array.isArray(ciphertext) || !ciphertext.every(
      (c) => typeof c === "number" || typeof c === "string" || Array.isArray(c) && c.length === 2 && typeof c[0] === "number" && typeof c[1] === "number"
    )) {
      throw new TypeError(
        "secret key requires a valid ciphertext from a multiple-node cluster"
      );
    }
    if (secretKey.cluster.nodes.length !== ciphertext.length && !secretKey.operations.sum) {
      throw new TypeError(
        "secret key and ciphertext must have the same associated cluster size"
      );
    }
  }
  if (secretKey.operations.store) {
    let optionalDecrypt = (uint8Array) => uint8Array;
    if ("material" in secretKey) {
      const symmetricKey = secretKey.material;
      optionalDecrypt = (uint8Array) => {
        try {
          const nonce = uint8Array.subarray(
            0,
            sodium.crypto_secretbox_NONCEBYTES
          );
          const cipher = uint8Array.subarray(
            sodium.crypto_secretbox_NONCEBYTES
          );
          return sodium.crypto_secretbox_open_easy(cipher, nonce, symmetricKey);
        } catch (_) {
          throw error;
        }
      };
    }
    if (secretKey.cluster.nodes.length === 1) {
      return _decode(optionalDecrypt(_unpack(ciphertext)));
    }
    const shares = ciphertext.map(_unpack).map(optionalDecrypt);
    let buffer = Buffer.from(shares[0]);
    for (let i = 1; i < shares.length; i++) {
      buffer = Buffer.from(_xor(buffer, Buffer.from(shares[i])));
    }
    return _decode(buffer);
  }
  if (secretKey.operations.sum) {
    if (secretKey.cluster.nodes.length === 1) {
      const paillierPrivateKey = secretKey.material;
      return paillierPrivateKey.decrypt(BigInt(`0x${ciphertext}`)) + _PLAINTEXT_SIGNED_INTEGER_MIN;
    }
    if (secretKey.threshold === void 0) {
      const inverseMasks2 = "material" in secretKey ? secretKey.material.map((mask) => {
        return bcu.modPow(
          BigInt(mask),
          _SECRET_SHARED_SIGNED_INTEGER_MODULUS - 2n,
          _SECRET_SHARED_SIGNED_INTEGER_MODULUS
        );
      }) : secretKey.cluster.nodes.map((_) => 1n);
      const shares2 = ciphertext;
      let plaintext2 = BigInt(0);
      for (let i = 0; i < shares2.length; i++) {
        const share = _mod(
          BigInt(shares2[i]) * inverseMasks2[i],
          _SECRET_SHARED_SIGNED_INTEGER_MODULUS
        );
        plaintext2 = _mod(
          plaintext2 + share,
          _SECRET_SHARED_SIGNED_INTEGER_MODULUS
        );
      }
      if (plaintext2 > _PLAINTEXT_SIGNED_INTEGER_MAX) {
        plaintext2 -= _SECRET_SHARED_SIGNED_INTEGER_MODULUS;
      }
      return plaintext2;
    }
    const inverseMasks = "material" in secretKey ? secretKey.material.map((mask) => {
      return bcu.modPow(
        BigInt(mask),
        _SECRET_SHARED_SIGNED_INTEGER_MODULUS - 2n,
        _SECRET_SHARED_SIGNED_INTEGER_MODULUS
      );
    }) : secretKey.cluster.nodes.map((_) => 1n);
    const shares = ciphertext.map(
      ([x, y], _i) => [
        BigInt(x),
        _mod(
          inverseMasks[x - 1] * BigInt(y),
          _SECRET_SHARED_SIGNED_INTEGER_MODULUS
        )
      ]
    );
    let plaintext = _shamirsRecover(
      shares,
      _SECRET_SHARED_SIGNED_INTEGER_MODULUS
    );
    if (plaintext > _PLAINTEXT_SIGNED_INTEGER_MAX) {
      plaintext -= _SECRET_SHARED_SIGNED_INTEGER_MODULUS;
    }
    return plaintext;
  }
  throw error;
}
function allot(document) {
  if (typeof document === "boolean" || typeof document === "number" || typeof document === "string" || document === null) {
    return [document];
  }
  if (Array.isArray(document)) {
    const results = document.map(allot);
    let multiplicity = 1;
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.length !== 1) {
        if (multiplicity === 1) {
          multiplicity = result.length;
        } else if (multiplicity !== result.length) {
          throw new TypeError(
            "number of shares in subdocument is not consistent"
          );
        }
      }
    }
    const shares = [];
    for (let i = 0; i < multiplicity; i++) {
      const share = [];
      for (let j = 0; j < results.length; j++) {
        share.push(results[j][results[j].length === 1 ? 0 : i]);
      }
      shares.push(share);
    }
    return shares;
  }
  if (document instanceof Object) {
    if ("%allot" in document) {
      if (Object.keys(document).length !== 1) {
        throw new TypeError("allotment must only have one key");
      }
      const items = document["%allot"];
      if (items.every((item) => typeof item === "number") || items.every((item) => typeof item === "string")) {
        const shares3 = [];
        for (let i = 0; i < items.length; i++) {
          shares3.push({ "%share": items[i] });
        }
        return shares3;
      }
      const sharesArrays = allot(
        items.map((item) => {
          return { "%allot": item };
        })
      );
      const shares2 = [];
      for (let i = 0; i < sharesArrays.length; i++) {
        const sharesCurrent = sharesArrays[i];
        shares2.push({
          "%share": sharesCurrent.map(
            (share) => share["%share"]
          )
        });
      }
      return shares2;
    }
    const existing = document;
    const results = {};
    let multiplicity = 1;
    for (const key in existing) {
      const result = allot(existing[key]);
      results[key] = result;
      if (result.length !== 1) {
        if (multiplicity === 1) {
          multiplicity = result.length;
        } else if (multiplicity !== result.length) {
          throw new TypeError(
            "number of shares in subdocument is not consistent"
          );
        }
      }
    }
    const shares = [];
    for (let i = 0; i < multiplicity; i++) {
      const share = {};
      for (const key in results) {
        const resultsForKey = results[key];
        share[key] = resultsForKey[resultsForKey.length === 1 ? 0 : i];
      }
      shares.push(share);
    }
    return shares;
  }
  throw new TypeError(
    "boolean, number, string, array, null, or object expected"
  );
}
async function unify(secretKey, documents, ignore = ["_created", "_updated"]) {
  if (documents.length === 1) {
    return documents[0];
  }
  if (documents.every((document) => Array.isArray(document))) {
    const length = documents[0].length;
    if (documents.every((document) => document.length === length)) {
      const results = [];
      for (let i = 0; i < length; i++) {
        const result = await unify(
          secretKey,
          documents.map((document) => document[i]),
          ignore
        );
        results.push(result);
      }
      return results;
    }
  }
  if (documents.every((document) => document instanceof Object)) {
    if (documents.every((document) => "%share" in document)) {
      if (documents.every((document) => typeof document["%share"] === "number") || documents.every((document) => typeof document["%share"] === "string")) {
        const shares = documents.map((document) => document["%share"]);
        const decrypted = decrypt(secretKey, shares);
        return decrypted;
      }
      const unwrapped = [];
      for (let i = 0; i < documents.length; i++) {
        unwrapped.push(documents[i]["%share"]);
      }
      const length = unwrapped[0].length;
      const results = [];
      for (let i = 0; i < length; i++) {
        const shares = [];
        for (let j = 0; j < documents.length; j++) {
          shares.push({ "%share": unwrapped[j][i] });
        }
        results.push(await unify(secretKey, shares, ignore));
      }
      return results;
    }
    const keys = Object.keys(documents[0]);
    const _zip = (a, b) => a.map((k, i) => [k, b[i]]);
    if (documents.every((document) => _equalKeys(keys, Object.keys(document)))) {
      const results = {};
      for (const key in documents[0]) {
        if (ignore.indexOf(key) === -1) {
          const result = await unify(
            secretKey,
            documents.map(
              (document) => document[key]
            ),
            ignore
          );
          results[key] = result;
        }
      }
      return results;
    }
  }
  let allValuesEqual = true;
  for (let i = 1; i < documents.length; i++) {
    allValuesEqual &&= documents[0] === documents[i];
  }
  if (allValuesEqual) {
    return documents[0];
  }
  throw new TypeError("array of compatible document shares expected");
}
export {
  ClusterKey,
  PublicKey2 as PublicKey,
  SecretKey,
  allot,
  decrypt,
  encrypt,
  shamirsAdd,
  unify
};
