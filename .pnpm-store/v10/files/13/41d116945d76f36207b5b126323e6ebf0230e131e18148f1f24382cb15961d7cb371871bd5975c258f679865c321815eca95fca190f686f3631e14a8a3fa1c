import type { Environment, UnknownDeployments, UnresolvedUnknownNamedAccounts, UnresolvedNetworkSpecificData, ResolvedExecutionParams, ResolvedUserConfig, DeploymentStore } from '@rocketh/core/types';
import { InternalEnvironment } from '../internal/types.js';
export declare function loadDeployments(deploymentStore: DeploymentStore, deploymentsPath: string, networkName: string, onlyABIAndAddress?: boolean, expectedChain?: {
    chainId: string;
    genesisHash?: `0x${string}`;
    deleteDeploymentsIfDifferentGenesisHash?: boolean;
}): Promise<{
    deployments: UnknownDeployments;
    migrations: Record<string, number>;
    chainId?: string;
    genesisHash?: `0x${string}`;
}>;
export declare function createEnvironment<NamedAccounts extends UnresolvedUnknownNamedAccounts = UnresolvedUnknownNamedAccounts, Data extends UnresolvedNetworkSpecificData = UnresolvedNetworkSpecificData, Deployments extends UnknownDeployments = UnknownDeployments>(userConfig: ResolvedUserConfig<NamedAccounts, Data>, resolvedExecutionParams: ResolvedExecutionParams, deploymentStore: DeploymentStore): Promise<{
    internal: InternalEnvironment;
    external: Environment<NamedAccounts, Data, Deployments>;
}>;
//# sourceMappingURL=index.d.ts.map