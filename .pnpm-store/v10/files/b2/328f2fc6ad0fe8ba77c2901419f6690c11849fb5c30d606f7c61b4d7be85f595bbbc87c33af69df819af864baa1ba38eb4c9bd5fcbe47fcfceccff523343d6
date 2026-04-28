import UniversalProvider from '@walletconnect/universal-provider';
import { type Connector, type Provider } from '@reown/appkit-controllers';
import { AdapterBlueprint } from '@reown/appkit-controllers';
import { type Address } from '@reown/appkit-utils/ethers';
export interface EIP6963ProviderDetail {
    info: Connector['info'];
    provider: Provider;
}
export declare class EthersAdapter extends AdapterBlueprint {
    private ethersConfig?;
    private balancePromises;
    private universalProvider?;
    private ethersProviders;
    constructor();
    private createEthersConfig;
    signMessage(params: AdapterBlueprint.SignMessageParams): Promise<AdapterBlueprint.SignMessageResult>;
    sendTransaction(params: AdapterBlueprint.SendTransactionParams): Promise<AdapterBlueprint.SendTransactionResult>;
    writeContract(params: AdapterBlueprint.WriteContractParams): Promise<AdapterBlueprint.WriteContractResult>;
    estimateGas(params: AdapterBlueprint.EstimateGasTransactionArgs): Promise<AdapterBlueprint.EstimateGasTransactionResult>;
    parseUnits(params: AdapterBlueprint.ParseUnitsParams): AdapterBlueprint.ParseUnitsResult;
    formatUnits(params: AdapterBlueprint.FormatUnitsParams): AdapterBlueprint.FormatUnitsResult;
    syncConnection(params: Pick<AdapterBlueprint.SyncConnectionParams, 'id' | 'chainId'>): Promise<AdapterBlueprint.ConnectResult>;
    syncConnectors(): Promise<void>;
    private disconnectAll;
    writeSolanaTransaction(): Promise<{
        hash: string;
    }>;
    syncConnections({ connectToFirstConnector }: AdapterBlueprint.SyncConnectionsParams): Promise<void>;
    setUniversalProvider(universalProvider: UniversalProvider): Promise<void>;
    private eip6963EventHandler;
    private listenInjectedConnector;
    connect({ id, address, type, chainId, socialUri }: AdapterBlueprint.ConnectParams): Promise<AdapterBlueprint.ConnectResult>;
    reconnect(params: AdapterBlueprint.ConnectParams): Promise<void>;
    getAccounts(params: AdapterBlueprint.GetAccountsParams): Promise<AdapterBlueprint.GetAccountsResult>;
    disconnect(params: AdapterBlueprint.DisconnectParams): Promise<{
        connections: import("@reown/appkit-common").Connection[];
    }>;
    getBalance(params: AdapterBlueprint.GetBalanceParams): Promise<AdapterBlueprint.GetBalanceResult>;
    switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void>;
    getWalletConnectProvider(): AdapterBlueprint.GetWalletConnectProviderResult;
    private revokeProviderPermissions;
    getCapabilities(params: AdapterBlueprint.GetCapabilitiesParams): Promise<unknown>;
    grantPermissions(params: AdapterBlueprint.GrantPermissionsParams): Promise<unknown>;
    revokePermissions(params: AdapterBlueprint.RevokePermissionsParams): Promise<Address>;
    walletGetAssets(params: AdapterBlueprint.WalletGetAssetsParams): Promise<AdapterBlueprint.WalletGetAssetsResponse>;
    private toChecksummedAddress;
}
