import { formatUnits, parseUnits } from 'ethers';
import type { EstimateGasTransactionArgs, Provider, SendTransactionArgs, WriteContractArgs } from '@reown/appkit-controllers';
export declare const EthersMethods: {
    signMessage: (message: string, provider: Provider, address: string) => Promise<`0x${string}`>;
    estimateGas: (data: EstimateGasTransactionArgs, provider: Provider, address: string, networkId: number) => Promise<bigint>;
    sendTransaction: (data: SendTransactionArgs, provider: Provider, address: string, networkId: number) => Promise<`0x${string}`>;
    writeContract: (data: WriteContractArgs, provider: Provider, address: string, chainId: number) => Promise<any>;
    parseWalletCapabilities: (str: string) => any;
    parseUnits: typeof parseUnits;
    formatUnits: typeof formatUnits;
};
