import { Abi } from 'abitype';
import type { Artifact, DevDoc, UserDoc } from '../../types.js';
type CreateMutable<Type> = {
    -readonly [Property in keyof Type]: Type[Property];
};
export declare function mergeABIs(list: {
    name: string;
    abi: Abi;
}[], options?: {
    doNotCheckForConflicts?: boolean;
}): {
    mergedABI: (import("abitype").AbiConstructor | import("abitype").AbiError | import("abitype").AbiEvent | import("abitype").AbiFallback | import("abitype").AbiFunction | import("abitype").AbiReceive)[];
    added: Map<string, import("abitype").AbiConstructor | import("abitype").AbiError | import("abitype").AbiEvent | import("abitype").AbiFallback | import("abitype").AbiFunction | import("abitype").AbiReceive>;
    sigJSMap: Map<`0x${string}`, {
        index: number;
        routeName: string;
        functionName: string;
    }>;
};
export declare function mergeArtifacts(list: {
    name: string;
    artifact: Partial<Artifact<Abi>> & {
        abi: Abi;
    };
}[], options?: {
    doNotCheckForConflicts?: boolean;
}): {
    mergedABI: (import("abitype").AbiConstructor | import("abitype").AbiError | import("abitype").AbiEvent | import("abitype").AbiFallback | import("abitype").AbiFunction | import("abitype").AbiReceive)[];
    added: Map<string, import("abitype").AbiConstructor | import("abitype").AbiError | import("abitype").AbiEvent | import("abitype").AbiFallback | import("abitype").AbiFunction | import("abitype").AbiReceive>;
    mergedDevDocs: CreateMutable<DevDoc>;
    mergedUserDocs: CreateMutable<UserDoc>;
    sigJSMap: Map<`0x${string}`, {
        index: number;
        routeName: string;
        functionName: string;
    }>;
};
export {};
//# sourceMappingURL=artifacts.d.ts.map