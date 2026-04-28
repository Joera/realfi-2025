import 'tsx';
import fs from 'node:fs';
import path from 'node:path';
import prompts from 'prompts';
import { resolveConfig, resolveExecutionParams, getEnvironmentName, getChainIdForEnvironment, createExecutor, loadDeployments, loadEnvironment, } from 'rocketh';
import { enhanceEnvIfNeeded } from '@rocketh/core/environment';
import { traverseMultipleDirectory } from '../utils/fs.js';
import { createFSDeploymentStore } from '../environment/deployment-store.js';
import { logs } from 'named-logs';
import { chainByCanonicalName, chainById } from '../environment/chains.js';
const logger = logs('@rocketh/node');
// used by users
export function setupEnvironmentFromFiles(extensions) {
    async function loadAndExecuteDeploymentsWithExtensions(executionParams, args) {
        const env = await loadAndExecuteDeploymentsFromFiles(executionParams, args);
        return enhanceEnvIfNeeded(env, extensions);
    }
    async function loadAndExecuteDeploymentsWithExtensionsWithConfig(executionParams, config, args) {
        const env = await loadAndExecuteDeploymentsFromFilesWithSpecificConfig(executionParams, config, args);
        return enhanceEnvIfNeeded(env, extensions);
    }
    async function loadEnvironmentWithExtensions(executionParams) {
        const env = await loadEnvironmentFromFiles(executionParams);
        return enhanceEnvIfNeeded(env, extensions);
    }
    async function loadEnvironmentWithExtensionsWithConfig(executionParams, config) {
        const env = await loadEnvironmentFromFilesWithSpecificConfig(executionParams, config);
        return enhanceEnvIfNeeded(env, extensions);
    }
    return {
        loadAndExecuteDeploymentsFromFiles: loadAndExecuteDeploymentsWithExtensions,
        loadEnvironmentFromFiles: loadEnvironmentWithExtensions,
        loadEnvironmentFromFilesWithConfig: loadEnvironmentWithExtensionsWithConfig,
        loadAndExecuteDeploymentsFromFilesWithConfig: loadAndExecuteDeploymentsWithExtensionsWithConfig,
    };
}
async function readConfig() {
    let configFile;
    let tsVersion;
    let jsVersion;
    if (typeof process !== 'undefined') {
        const listOfFileToTryForTS = [
            path.join(process.cwd(), 'rocketh.ts'),
            path.join(process.cwd(), 'rocketh', 'config.ts'),
        ];
        for (const filepath of listOfFileToTryForTS) {
            if (fs.existsSync(filepath)) {
                tsVersion = `file://${filepath}`;
                break;
            }
        }
        const listOfFileToTryForJS = [
            path.join(process.cwd(), 'rocketh.js'),
            path.join(process.cwd(), 'rocketh', 'config.js'),
        ];
        for (const filepath of listOfFileToTryForJS) {
            if (fs.existsSync(filepath)) {
                jsVersion = `file://${filepath}`;
                break;
            }
        }
    }
    const existingConfigs = [tsVersion, jsVersion].filter(Boolean).length;
    // console.log({tsFilePath, tsVersionExists, existingConfigs});
    // Throw error if multiple config files exist
    if (existingConfigs > 1) {
        throw new Error('Multiple configuration files found. Please use only one of: rocketh.ts, rocketh.js');
    }
    if (tsVersion) {
        const moduleLoaded = await import(tsVersion);
        configFile = moduleLoaded.config;
        // console.log({tsVersionExists: configFile});
        // if ((configFile as any).default) {
        // 	configFile = (configFile as any).default as ConfigFile;
        // 	if ((configFile as any).default) {
        // 		logger.warn(`double default...`);
        // 		configFile = (configFile as any).default as ConfigFile;
        // 	}
        // }
    }
    else if (jsVersion) {
        const moduleLoaded = await import(jsVersion);
        configFile = moduleLoaded.config;
    }
    const newChainConfigs = {};
    const chainIds = Object.keys(chainById).map((v) => parseInt(v));
    for (const chainId of chainIds) {
        const existingConfig = configFile?.chains?.[chainId];
        // TODO what do we do about further info?
        //  for now, we just take the first one
        const defaultInfo = chainById[chainId][0];
        newChainConfigs[chainId] = {
            ...existingConfig,
            info: {
                ...defaultInfo,
                ...existingConfig?.info,
            },
        };
    }
    const newEnvironments = {};
    const canonicalNames = Object.keys(chainByCanonicalName);
    for (const canonicalName of canonicalNames) {
        const existingConfig = configFile?.environments?.[canonicalName];
        const defaultConfig = chainByCanonicalName[canonicalName];
        newEnvironments[canonicalName] = {
            chain: defaultConfig.id,
            ...existingConfig,
        };
    }
    const config = configFile
        ? { ...configFile, chains: newChainConfigs }
        : { chains: newChainConfigs };
    return config;
}
// used by @rocketh/export, @rocketh/verifier, @rocketh/doc
export async function readAndResolveConfig(overrides) {
    const configFile = await readConfig();
    return resolveConfig(configFile, overrides);
}
const deploymentStore = createFSDeploymentStore();
const promptExecutor = {
    async prompt(request) {
        const answer = await prompts(request);
        return {
            proceed: answer.proceed,
        };
    },
    exit() {
        process.exit();
    },
};
const executor = createExecutor(deploymentStore, promptExecutor);
// used by @rocketh/export, @rocketh/verifier, @rocketh/doc
export function loadDeploymentsFromFiles(deploymentsPath, networkName, onlyABIAndAddress, expectedChain) {
    return loadDeployments(deploymentStore, deploymentsPath, networkName, onlyABIAndAddress, expectedChain);
}
// used by hardhat-deploy
export async function loadEnvironmentFromFiles(executionParams) {
    const config = await readConfig();
    return loadEnvironmentFromFilesWithSpecificConfig(executionParams, config);
}
async function loadEnvironmentFromFilesWithSpecificConfig(executionParams, config) {
    return loadEnvironment(config, executionParams, deploymentStore);
}
// used by hardhat-deploy
export async function loadAndExecuteDeploymentsFromFiles(executionParams, args) {
    const config = await readConfig();
    return loadAndExecuteDeploymentsFromFilesWithSpecificConfig(executionParams, config, args);
}
async function loadAndExecuteDeploymentsFromFilesWithSpecificConfig(executionParams, config, args) {
    const userConfig = await resolveConfig(config, executionParams.config);
    const { name: environmentName, fork } = getEnvironmentName(executionParams);
    const chainId = await getChainIdForEnvironment(userConfig, environmentName, executionParams);
    const resolvedExecutionParams = resolveExecutionParams(userConfig, executionParams, chainId);
    // console.log(JSON.stringify(options, null, 2));
    // console.log(JSON.stringify(resolvedConfig, null, 2));
    return _executeDeployScriptsFromFiles(userConfig, resolvedExecutionParams, args);
}
// TODO: remove this function or export it in index.ts
async function executeDeployScriptsFromFiles(userConfig, executionParams, args) {
    executionParams = executionParams || {};
    const resolveduserConfig = resolveConfig(userConfig, executionParams.config);
    const { name: environmentName, fork } = getEnvironmentName(executionParams);
    const chainId = await getChainIdForEnvironment(resolveduserConfig, environmentName, executionParams);
    const resolvedExecutionParams = resolveExecutionParams(resolveduserConfig, executionParams, chainId);
    return _executeDeployScriptsFromFiles(resolveduserConfig, resolvedExecutionParams, args);
}
async function _executeDeployScriptsFromFiles(userConfig, resolvedExecutionParams, args) {
    let filepaths;
    filepaths = traverseMultipleDirectory(resolvedExecutionParams.scripts);
    filepaths = filepaths
        .filter((v) => !path.basename(v).startsWith('_'))
        .sort((a, b) => {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });
    const moduleObjects = [];
    for (const filepath of filepaths) {
        const scriptFilePath = path.resolve(filepath);
        let scriptModule;
        try {
            scriptModule = await import(`file://${scriptFilePath}`);
            // console.log({
            // 	scriptFilePath,
            // 	scriptModule,
            // });
            if (scriptModule.default) {
                scriptModule = scriptModule.default;
                if (scriptModule.default) {
                    logger.warn(`double default...`);
                    scriptModule = scriptModule.default;
                }
            }
            moduleObjects.push({ id: scriptFilePath, module: scriptModule });
        }
        catch (e) {
            logger.error(`could not import ${filepath}`);
            throw e;
        }
    }
    return executor.executeDeployScriptModules(moduleObjects, userConfig, resolvedExecutionParams, args);
}
//# sourceMappingURL=index.js.map