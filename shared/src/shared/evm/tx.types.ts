import type { Hash, TransactionReceipt } from "viem";

export interface TxOptions {
    deploy?: boolean;
    waitForReceipt?: boolean;
    confirmations?: number;
    excludeAddress?: string; // for extractDeployedAddress
    nth?: number;            // which deployed contract to return
}

export interface TxResult {
    txHash: Hash;
    receipt?: TransactionReceipt;
    deployedAddress?: string;
}