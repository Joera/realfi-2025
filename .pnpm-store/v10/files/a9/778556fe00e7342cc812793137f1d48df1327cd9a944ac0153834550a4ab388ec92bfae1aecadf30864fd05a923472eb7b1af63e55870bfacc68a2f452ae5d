import 'tsx';
import { type Environment, type ExecutionParams, type UnknownDeployments, type UnresolvedNetworkSpecificData, type UnresolvedUnknownNamedAccounts, type EnhancedEnvironment, type ResolvedUserConfig, type ConfigOverrides, type UserConfig } from '@rocketh/core/types';
export declare function setupEnvironmentFromFiles<Extensions extends Record<string, (env: Environment<any, any, any>) => any> = {}, NamedAccounts extends UnresolvedUnknownNamedAccounts = UnresolvedUnknownNamedAccounts, Data extends UnresolvedNetworkSpecificData = UnresolvedNetworkSpecificData, Extra extends Record<string, unknown> = Record<string, unknown>>(extensions: Extensions): {
    loadAndExecuteDeploymentsFromFiles: <Extra_1 extends Record<string, unknown> = Record<string, unknown>, ArgumentsType = undefined>(executionParams: ExecutionParams<Extra_1>, args?: ArgumentsType) => Promise<EnhancedEnvironment<NamedAccounts, Data, UnknownDeployments, Extensions>>;
    loadEnvironmentFromFiles: (executionParams: ExecutionParams<Extra>) => Promise<EnhancedEnvironment<NamedAccounts, Data, UnknownDeployments, Extensions>>;
    loadEnvironmentFromFilesWithConfig: (executionParams: ExecutionParams<Extra>, config: UserConfig<NamedAccounts, Data>) => Promise<EnhancedEnvironment<NamedAccounts, Data, UnknownDeployments, Extensions>>;
    loadAndExecuteDeploymentsFromFilesWithConfig: <Extra_1 extends Record<string, unknown> = Record<string, unknown>, ArgumentsType = undefined>(executionParams: ExecutionParams<Extra_1>, config: UserConfig<NamedAccounts, Data>, args?: ArgumentsType) => Promise<EnhancedEnvironment<NamedAccounts, Data, UnknownDeployments, Extensions>>;
};
export declare function readAndResolveConfig<NamedAccounts extends UnresolvedUnknownNamedAccounts = UnresolvedUnknownNamedAccounts, Data extends UnresolvedNetworkSpecificData = UnresolvedNetworkSpecificData>(overrides?: ConfigOverrides): Promise<ResolvedUserConfig<NamedAccounts, Data>>;
export declare function loadDeploymentsFromFiles(deploymentsPath: string, networkName: string, onlyABIAndAddress?: boolean, expectedChain?: {
    chainId: string;
    genesisHash?: `0x${string}`;
    deleteDeploymentsIfDifferentGenesisHash?: boolean;
}): Promise<{
    deployments: UnknownDeployments;
    migrations: Record<string, number>;
    chainId?: string;
    genesisHash?: `0x${string}`;
}>;
export declare function loadEnvironmentFromFiles<NamedAccounts extends UnresolvedUnknownNamedAccounts = UnresolvedUnknownNamedAccounts, Data extends UnresolvedNetworkSpecificData = UnresolvedNetworkSpecificData, Extra extends Record<string, unknown> = Record<string, unknown>>(executionParams: ExecutionParams<Extra>): Promise<Environment<NamedAccounts, Data, UnknownDeployments>>;
export declare function loadAndExecuteDeploymentsFromFiles<NamedAccounts extends UnresolvedUnknownNamedAccounts = UnresolvedUnknownNamedAccounts, Data extends UnresolvedNetworkSpecificData = UnresolvedNetworkSpecificData, ArgumentsType = undefined, Extra extends Record<string, unknown> = Record<string, unknown>>(executionParams: ExecutionParams<Extra>, args?: ArgumentsType): Promise<Environment<NamedAccounts, Data, UnknownDeployments>>;
//# sourceMappingURL=index.d.ts.map