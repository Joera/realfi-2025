import { setupLogger } from 'named-logs-console';
import { task } from 'hardhat/config';
import './type-extensions.js';
import { ArgumentType } from 'hardhat/types/arguments';
// const deployTask = import.meta.resolve('./tasks/deploy.js').replace('.ts', '.js');
// console.log({deployTask});
setupLogger(['rocketh', '@rocketh/node'], {
    enabled: true,
    level: 3,
});
const hardhatPlugin = {
    id: 'hardhat-deploy',
    hookHandlers: {
        config: () => import('./hook-handlers/config.js'),
        solidity: () => import('./hook-handlers/solidity.js'),
    },
    tasks: [
        task('deploy', 'Deploy contracts')
            // .addFlag('skipGasReport', 'if set, skip gas report')
            .addFlag({ name: 'skipPrompts', description: 'if set, skip any prompts' })
            .addFlag({ name: 'reportGasUsed', description: 'if set, report gas used' })
            .addOption({
            name: 'saveDeployments',
            description: 'if set to false, do not save deployments',
            defaultValue: undefined,
            type: ArgumentType.STRING_WITHOUT_DEFAULT,
        })
            .addOption({
            name: 'tags',
            description: 'specify which tags to deploy, separated by commas',
            defaultValue: undefined,
            type: ArgumentType.STRING_WITHOUT_DEFAULT,
        })
            .addOption({
            name: 'pollingInterval',
            description: 'specify the polling interval used to check transactions',
            defaultValue: undefined,
            type: ArgumentType.STRING_WITHOUT_DEFAULT,
        })
            .setAction(() => import('./tasks/deploy.js'))
            .build(),
    ],
    npmPackage: 'hardhat-deploy',
};
export default hardhatPlugin;
export function getHardhatConnection(env) {
    if (!env.extra?.connection) {
        throw new Error('Hardhat deploy connection not found in the environment');
    }
    return env.extra.connection;
}
//# sourceMappingURL=index.js.map