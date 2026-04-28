import { Abi } from 'abitype';
import { Artifact, DevDoc, UserDoc } from '../../types.js';
type CreateMutable<Type> = {
    -readonly [Property in keyof Type]: Type[Property];
};
export declare function mergeABIs(list: {
    name: string;
    abi: Abi;
}[], options?: {
    doNotCheckForConflicts?: boolean;
}): {
    mergedABI: Abi;
    added: Map<string, unknown>;
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
    mergedABI: Abi;
    added: Map<string, unknown>;
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