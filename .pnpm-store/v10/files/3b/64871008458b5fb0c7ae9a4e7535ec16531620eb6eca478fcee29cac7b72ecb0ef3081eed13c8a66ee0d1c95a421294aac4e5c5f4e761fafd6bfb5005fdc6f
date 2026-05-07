/**
 * Adds two sets of shares pointwise, assuming they use the same indices.
 */
declare function shamirsAdd(shares1: [number, number][], shares2: [number, number][]): [number, number][];
/**
 * Cluster configuration information.
 */
interface Cluster {
    nodes: object[];
}
/**
 * Record indicating what operations on ciphertexts are supported.
 */
interface Operations {
    store?: boolean;
    match?: boolean;
    sum?: boolean;
}
/**
 * Data structure for representing all categories of secret key instances.
 */
declare class SecretKey {
    material?: object | number;
    cluster: Cluster;
    operations: Operations;
    threshold?: number;
    protected constructor(cluster: Cluster, operations: Operations);
    /**
     * Return a secret key built according to what is specified in the supplied
     * cluster configuration and operation specification.
     */
    static generate(cluster: Cluster, operations: Operations, threshold?: number | null, seed?: Uint8Array | Buffer | string | null): Promise<SecretKey>;
    /**
     * Return a JSON-compatible object representation of this key instance.
     */
    dump(): {
        material: object | number[] | string;
        cluster: Cluster;
        operations: Operations;
        threshold?: number;
    };
    /**
     * Return an instance built from a JSON-compatible object representation.
     */
    static load(object: object): SecretKey;
}
/**
 * Data structure for representing all categories of cluster key instances.
 */
declare class ClusterKey extends SecretKey {
    protected constructor(cluster: Cluster, operations: Operations, threshold?: number | undefined);
    /**
     * Return a cluster key built according to what is specified in the supplied
     * cluster configuration and operation specification.
     */
    static generate(cluster: Cluster, operations: Operations, threshold?: number | undefined): Promise<ClusterKey>;
    /**
     * Return a JSON-compatible object representation of this key instance.
     */
    dump(): {
        material: object | number[] | string;
        cluster: Cluster;
        operations: Operations;
        threshold?: number;
    };
    /**
     * Return an instance built from a JSON-compatible object representation.
     */
    static load(object: object): ClusterKey;
}
/**
 * Data structure for representing all categories of public key instances.
 */
declare class PublicKey {
    material: object;
    cluster: Cluster;
    operations: Operations;
    private constructor();
    /**
     * Return a public key built according to what is specified in the supplied
     * secret key.
     */
    static generate(secretKey: SecretKey): Promise<PublicKey>;
    /**
     * Return a JSON-compatible object representation of this key instance.
     */
    dump(): object;
    /**
     * Return an instance built from a JSON-compatible object representation.
     */
    static load(object: object): PublicKey;
}
/**
 * Return the ciphertext obtained by using the supplied key to encrypt the
 * supplied plaintext.
 */
declare function encrypt(key: PublicKey | SecretKey, plaintext: number | bigint | string | Uint8Array): Promise<string | string[] | number[] | number[][]>;
/**
 * Return the plaintext obtained by using the supplied key to decrypt the
 * supplied ciphertext.
 */
declare function decrypt(secretKey: SecretKey, ciphertext: string | string[] | number[] | number[][]): Promise<bigint | string | Uint8Array>;
/**
 * Convert an object that may contain ciphertexts intended for multi-node
 * clusters into secret shares of that object. Shallow copies are created
 * whenever possible.
 */
declare function allot(document: object): object[];
/**
 * Convert an array of compatible secret share objects into a single object
 * that deduplicates matching plaintext leaf values and recombines matching
 * secret share leaf values.
 */
declare function unify(secretKey: SecretKey, documents: object[], ignore?: string[]): Promise<object | Array<object>>;

export { ClusterKey, PublicKey, SecretKey, allot, decrypt, encrypt, shamirsAdd, unify };
