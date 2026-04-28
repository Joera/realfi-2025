import * as _m0 from "protobufjs/minimal";
export declare const protobufPackage = "nillion.meta.v1";
export interface MsgPayFor {
    resource: Uint8Array;
    fromAddress: string;
    amount: Amount[];
}
export interface Amount {
    denom: string;
    amount: string;
}
export declare const MsgPayFor: {
    encode(message: MsgPayFor, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgPayFor;
    fromJSON(object: any): MsgPayFor;
    toJSON(message: MsgPayFor): unknown;
    create<I extends {
        resource?: Uint8Array | undefined;
        fromAddress?: string | undefined;
        amount?: {
            denom?: string | undefined;
            amount?: string | undefined;
        }[] | undefined;
    } & {
        resource?: Uint8Array | undefined;
        fromAddress?: string | undefined;
        amount?: ({
            denom?: string | undefined;
            amount?: string | undefined;
        }[] & ({
            denom?: string | undefined;
            amount?: string | undefined;
        } & {
            denom?: string | undefined;
            amount?: string | undefined;
        } & { [K in Exclude<keyof I["amount"][number], keyof Amount>]: never; })[] & { [K_1 in Exclude<keyof I["amount"], keyof {
            denom?: string | undefined;
            amount?: string | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, keyof MsgPayFor>]: never; }>(base?: I): MsgPayFor;
    fromPartial<I_1 extends {
        resource?: Uint8Array | undefined;
        fromAddress?: string | undefined;
        amount?: {
            denom?: string | undefined;
            amount?: string | undefined;
        }[] | undefined;
    } & {
        resource?: Uint8Array | undefined;
        fromAddress?: string | undefined;
        amount?: ({
            denom?: string | undefined;
            amount?: string | undefined;
        }[] & ({
            denom?: string | undefined;
            amount?: string | undefined;
        } & {
            denom?: string | undefined;
            amount?: string | undefined;
        } & { [K_3 in Exclude<keyof I_1["amount"][number], keyof Amount>]: never; })[] & { [K_4 in Exclude<keyof I_1["amount"], keyof {
            denom?: string | undefined;
            amount?: string | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_5 in Exclude<keyof I_1, keyof MsgPayFor>]: never; }>(object: I_1): MsgPayFor;
};
export declare const Amount: {
    encode(message: Amount, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Amount;
    fromJSON(object: any): Amount;
    toJSON(message: Amount): unknown;
    create<I extends {
        denom?: string | undefined;
        amount?: string | undefined;
    } & {
        denom?: string | undefined;
        amount?: string | undefined;
    } & { [K in Exclude<keyof I, keyof Amount>]: never; }>(base?: I): Amount;
    fromPartial<I_1 extends {
        denom?: string | undefined;
        amount?: string | undefined;
    } & {
        denom?: string | undefined;
        amount?: string | undefined;
    } & { [K_1 in Exclude<keyof I_1, keyof Amount>]: never; }>(object: I_1): Amount;
};
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export {};
