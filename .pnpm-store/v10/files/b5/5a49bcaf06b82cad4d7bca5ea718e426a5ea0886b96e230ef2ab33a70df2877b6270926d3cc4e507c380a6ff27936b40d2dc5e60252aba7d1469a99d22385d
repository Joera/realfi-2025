import type { Environment } from '../types.js';
declare const exampleExtensions: {
    deploy: (env: Environment) => (contractName: string, args: any[]) => Promise<void>;
    verify: (env: Environment) => (address: string) => Promise<boolean>;
    getBalance: (env: Environment) => (address: string) => Promise<bigint>;
    syncFunction: (env: Environment) => (value: number) => number;
    provider: (env: Environment) => import("../environment/providers/TransactionHashTracker.js").TransactionHashTracker;
};
declare const enhancedEnv: import("../types.js").CurriedFunctions<{
    deploy: (env: Environment) => (contractName: string, args: any[]) => Promise<void>;
    verify: (env: Environment) => (address: string) => Promise<boolean>;
    getBalance: (env: Environment) => (address: string) => Promise<bigint>;
    syncFunction: (env: Environment) => (value: number) => number;
    provider: (env: Environment) => import("../environment/providers/TransactionHashTracker.js").TransactionHashTracker;
}>;
declare function testTypes(): Promise<void>;
export { testTypes, enhancedEnv, exampleExtensions };
//# sourceMappingURL=extensions.test.d.ts.map