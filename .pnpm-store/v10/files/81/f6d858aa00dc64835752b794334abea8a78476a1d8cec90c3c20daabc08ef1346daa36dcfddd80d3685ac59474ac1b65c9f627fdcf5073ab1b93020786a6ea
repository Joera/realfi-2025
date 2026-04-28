import type { Environment, ExecutionParams, ResolvedExecutionParams, UnknownDeployments, UnresolvedNetworkSpecificData, UnresolvedUnknownNamedAccounts, DeployScriptModule, EnhancedDeployScriptFunction, ResolvedUserConfig, ConfigOverrides, UserConfig, PromptExecutor, DeploymentStore, ModuleObject } from '@rocketh/core/types';
/**
 * Setup function that creates the execute function for deploy scripts. It allow to specify a set of functions that will be available in the environment.
 *
 * @param functions - An object of utility functions that expect Environment as their first parameter
 * @returns An execute function that provides an enhanced environment with curried functions
 *
 * @example
 * ```typescript
 * const functions = {
 *   deploy: (env: Environment) => ((contractName: string, args: any[]) => Promise<void>),
 *   verify: (env: Environment) => ((address: string) => Promise<boolean>)
 * };
 *
 * const {deployScript} = setup(functions);
 *
 * export default deployScript(async (env, args) => {
 *   // env now includes both the original environment AND the curried functions
 *   await env.deploy('MyContract', []); // No need to pass env
 *   await env.verify('0x123...'); // No need to pass env
 *
 *   // Original environment properties are still available
 *   console.log(env.network.name);
 *   const deployment = env.get('MyContract');
 * }, { tags: ['deploy'] });
 * ```
 */
export declare function setupDeployScripts<Extensions extends Record<string, (env: Environment<any, any, any>) => any> = {}, NamedAccounts extends UnresolvedUnknownNamedAccounts = UnresolvedUnknownNamedAccounts, Data extends UnresolvedNetworkSpecificData = UnresolvedNetworkSpecificData, Deployments extends UnknownDeployments = UnknownDeployments, Extra extends Record<string, unknown> = Record<string, unknown>>(extensions: Extensions): {
    deployScript<ArgumentsType = undefined>(callback: EnhancedDeployScriptFunction<NamedAccounts, Data, ArgumentsType, Deployments, Extensions>, options: {
        tags?: string[];
        dependencies?: string[];
        id?: string;
        runAtTheEnd?: boolean;
    }): DeployScriptModule<NamedAccounts, Data, ArgumentsType, Deployments, Extra>;
};
export declare function resolveConfig<NamedAccounts extends UnresolvedUnknownNamedAccounts = UnresolvedUnknownNamedAccounts, Data extends UnresolvedNetworkSpecificData = UnresolvedNetworkSpecificData>(configFile: UserConfig, overrides?: ConfigOverrides): ResolvedUserConfig<NamedAccounts, Data>;
export declare function getChainIdForEnvironment(config: ResolvedUserConfig, environmentName: string, executionParams: ExecutionParams): Promise<number>;
export declare function getChainIdForExecutionParams(config: ResolvedUserConfig, executionParams: ExecutionParams): Promise<number>;
export declare function getEnvironmentName(executionParams: ExecutionParams): {
    name: string;
    fork: boolean;
};
export declare function resolveExecutionParams<Extra extends Record<string, unknown> = Record<string, unknown>>(config: ResolvedUserConfig, executionParameters: ExecutionParams<Extra>, chainId: number): ResolvedExecutionParams<Extra>;
export declare function loadEnvironment<NamedAccounts extends UnresolvedUnknownNamedAccounts = UnresolvedUnknownNamedAccounts, Data extends UnresolvedNetworkSpecificData = UnresolvedNetworkSpecificData, Extra extends Record<string, unknown> = Record<string, unknown>>(config: UserConfig<NamedAccounts, Data>, executionParams: ExecutionParams<Extra>, deploymentStore: DeploymentStore): Promise<Environment<NamedAccounts, Data, UnknownDeployments>>;
export declare function createExecutor(deploymentStore: DeploymentStore, promptExecutor: PromptExecutor): {
    executeDeployScriptModules: <NamedAccounts extends UnresolvedUnknownNamedAccounts = UnresolvedUnknownNamedAccounts, Data extends UnresolvedNetworkSpecificData = UnresolvedNetworkSpecificData, ArgumentsType = undefined>(moduleObjects: ModuleObject<NamedAccounts, Data, ArgumentsType>[], userConfig: ResolvedUserConfig<NamedAccounts, Data>, resolvedExecutionParams: ResolvedExecutionParams, args?: ArgumentsType) => Promise<Environment<NamedAccounts, Data, UnknownDeployments>>;
    resolveConfigAndExecuteDeployScriptModules: <NamedAccounts extends UnresolvedUnknownNamedAccounts = UnresolvedUnknownNamedAccounts, Data extends UnresolvedNetworkSpecificData = UnresolvedNetworkSpecificData, ArgumentsType = undefined, Extra extends Record<string, unknown> = Record<string, unknown>>(moduleObjects: ModuleObject<NamedAccounts, Data, ArgumentsType>[], userConfig: UserConfig, executionParams?: ExecutionParams<Extra>, args?: ArgumentsType) => Promise<Environment<NamedAccounts, Data, UnknownDeployments>>;
};
//# sourceMappingURL=index.d.ts.map