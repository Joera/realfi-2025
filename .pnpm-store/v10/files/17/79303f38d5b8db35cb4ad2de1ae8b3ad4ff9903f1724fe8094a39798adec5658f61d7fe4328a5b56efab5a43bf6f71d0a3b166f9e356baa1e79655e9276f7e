import { JSONToString, stringToJSON } from '@rocketh/core/json';
import { logger, spin } from '../internal/logging.js';
import { mergeArtifacts } from '@rocketh/core/artifacts';
import { TransactionHashTrackerProvider } from '@rocketh/core/providers';
function wait(numSeconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, numSeconds * 1000);
    });
}
function displayTransaction(transaction) {
    if ('maxFeePerGas' in transaction) {
        return `(type ${transaction.type}, maxFeePerGas: ${BigInt(transaction.maxFeePerGas).toString()}, maxPriorityFeePerGas: ${BigInt(transaction.maxPriorityFeePerGas).toString()})`;
    }
    else if ('gasPrice' in transaction) {
        return `(type ${transaction.type ? Number(transaction.type) : '0'}, gasPrice: ${BigInt(transaction.gasPrice).toString()})`;
    }
    else {
        return `(tx with no gas pricing, type: ${Number(transaction.type)})`;
    }
}
/**
 * Impersonate accounts that are not available in the provider's accounts list.
 * This is useful for testing with named accounts that don't have private keys available.
 *
 * @param provider - The EIP1193 provider
 * @param unknownAccounts - List of addresses to impersonate
 * @param autoImpersonate - Whether auto-impersonation is enabled
 */
async function impersonateAccounts(provider, unknownAccounts, autoImpersonate) {
    // Check if auto-impersonation is enabled
    if (!autoImpersonate) {
        return [];
    }
    const impersonatedAccounts = [];
    // Attempt to impersonate each unknown account
    for (const address of unknownAccounts) {
        try {
            // Use type assertion since hardhat_impersonateAccount is not part of standard EIP1193
            await provider.request({
                method: 'hardhat_impersonateAccount',
                params: [address],
            });
            impersonatedAccounts.push(address);
        }
        catch (error) {
            // Silently fail if the provider doesn't support impersonation
            // This allows the feature to work gracefully with non-hardhat/anvil providers
            if (!error.message?.includes('method not supported') && !error.message?.includes('Method not found')) {
                logger.debug(`Failed to impersonate account ${address}: ${error.message}`);
            }
        }
    }
    return impersonatedAccounts;
}
export async function loadDeployments(deploymentStore, deploymentsPath, networkName, onlyABIAndAddress, expectedChain) {
    const deploymentsFound = {};
    let fileNames;
    try {
        fileNames = await deploymentStore.listFiles(deploymentsPath, networkName, (name) => !(name.startsWith('.') && name !== '.migrations.json') && name !== 'solcInputs');
    }
    catch (e) {
        // console.log('no folder at ' + deployPath);
        return { deployments: {}, migrations: {} };
    }
    let chainId;
    let genesisHash;
    if (fileNames.length > 0) {
        if (await deploymentStore.hasFile(deploymentsPath, networkName, '.chain')) {
            const chainSTR = await deploymentStore.readFile(deploymentsPath, networkName, '.chain');
            const chainData = JSON.parse(chainSTR);
            chainId = chainData.chainId;
            genesisHash = chainData.genesisHash;
        }
        else if (await deploymentStore.hasFile(deploymentsPath, networkName, '.chainId')) {
            chainId = await deploymentStore.readFile(deploymentsPath, networkName, '.chainId');
        }
        else {
            throw new Error(`A '.chain' or '.chainId' file is expected to be present in the deployment folder for network ${networkName}`);
        }
        if (expectedChain) {
            if (expectedChain.chainId !== chainId) {
                throw new Error(`Loading deployment from environment '${networkName}' (with chainId: ${chainId}) for a different chainId (${expectedChain.chainId})`);
            }
            if (genesisHash) {
                if (expectedChain.genesisHash && expectedChain.genesisHash !== genesisHash) {
                    if (expectedChain.deleteDeploymentsIfDifferentGenesisHash) {
                        // we delete the old folder
                        await deploymentStore.deleteAll(deploymentsPath, networkName);
                        return { deployments: {}, migrations: {} };
                    }
                    else {
                        throw new Error(`Loading deployment from environment '${networkName}' (with genesisHash: ${genesisHash}) for a different genesisHash (${expectedChain.genesisHash})`);
                    }
                }
            }
            else {
                console.warn(`genesisHash not found in environment '${networkName}' (with chainId: ${chainId}), writing .chain with expected one...`);
                await deploymentStore.writeFile(deploymentsPath, networkName, '.chain', JSON.stringify({ chainId: expectedChain.chainId, genesisHash: expectedChain.genesisHash }));
                try {
                    await deploymentStore.deleteFile(deploymentsPath, networkName, '.chainId');
                }
                catch { }
            }
        }
    }
    else {
        return { deployments: {}, migrations: {} };
    }
    let migrations = {};
    const migrationsFileName = '.migrations.json';
    if (await deploymentStore.hasFile(deploymentsPath, networkName, migrationsFileName)) {
        try {
            migrations = JSON.parse(await deploymentStore.readFile(deploymentsPath, networkName, migrationsFileName));
        }
        catch (err) {
            console.error(`failed to parse .migrations.json`);
        }
    }
    for (const fileName of fileNames) {
        if (fileName.substring(fileName.length - 5) === '.json' && fileName !== '.migrations.json') {
            let deployment = JSON.parse(await deploymentStore.readFile(deploymentsPath, networkName, fileName));
            if (onlyABIAndAddress) {
                deployment = {
                    address: deployment.address,
                    abi: deployment.abi,
                    linkedData: deployment.linkedData,
                };
            }
            const name = fileName.slice(0, fileName.length - 5);
            // console.log('fetching ' + deploymentFileName + '  for ' + name);
            deploymentsFound[name] = deployment;
        }
    }
    return { deployments: deploymentsFound, migrations, chainId, genesisHash };
}
export async function createEnvironment(userConfig, resolvedExecutionParams, deploymentStore) {
    const rawProvider = resolvedExecutionParams.provider;
    const provider = new TransactionHashTrackerProvider(rawProvider);
    const chainIdHex = await provider.request({ method: 'eth_chainId' });
    const chainId = '' + Number(chainIdHex);
    let genesisHash;
    try {
        let genesisBlock;
        try {
            genesisBlock = await provider.request({ method: 'eth_getBlockByNumber', params: ['earliest', false] });
        }
        catch {
            genesisBlock = await provider.request({ method: 'eth_getBlockByNumber', params: ['0x0', false] });
        }
        if (!genesisBlock) {
            console.error(`failed to get genesis block, returned null`);
        }
        genesisHash = genesisBlock?.hash;
    }
    catch (err) {
        console.error(`failed to get genesis block`);
    }
    const deploymentsFolder = userConfig.deployments;
    const environmentName = resolvedExecutionParams.environment.name;
    const saveDeployments = resolvedExecutionParams.saveDeployments;
    let networkTags = {};
    for (const networkTag of resolvedExecutionParams.environment.tags) {
        networkTags[networkTag] = true;
    }
    const resolvedAccounts = {};
    const allRemoteAccounts = await provider.request({ method: 'eth_accounts' });
    const accountCache = {};
    async function getAccount(name, accounts, accountDef) {
        if (accountCache[name]) {
            return accountCache[name];
        }
        let account;
        if (typeof accountDef === 'number') {
            const accountPerIndex = allRemoteAccounts[accountDef];
            if (accountPerIndex) {
                accountCache[name] = account = {
                    type: 'remote',
                    address: accountPerIndex,
                    signer: provider,
                };
            }
        }
        else if (typeof accountDef === 'string') {
            if (accountDef.startsWith('0x')) {
                if (accountDef.length === 66) {
                    const privateKeyProtocol = userConfig.signerProtocols?.['privateKey'];
                    if (privateKeyProtocol) {
                        const namedSigner = await privateKeyProtocol(`privateKey:${accountDef}`);
                        const [address] = await namedSigner.signer.request({ method: 'eth_accounts' });
                        accountCache[name] = account = {
                            ...namedSigner,
                            address,
                        };
                    }
                }
                else {
                    accountCache[name] = account = {
                        type: 'remote',
                        address: accountDef,
                        signer: provider,
                    };
                }
            }
            else {
                if (accountDef.indexOf(':') > 0) {
                    const [protocolID, extra] = accountDef.split(':');
                    const protocol = userConfig.signerProtocols?.[protocolID];
                    if (!protocol) {
                        throw new Error(`protocol: ${protocolID} is not supported`);
                    }
                    const namedSigner = await protocol(accountDef);
                    const [address] = await namedSigner.signer.request({ method: 'eth_accounts' });
                    accountCache[name] = account = {
                        ...namedSigner,
                        address,
                    };
                }
                else {
                    const accountFetched = await getAccount(name, accounts, accounts[accountDef]);
                    if (accountFetched) {
                        accountCache[name] = account = accountFetched;
                    }
                }
            }
        }
        else {
            // TODO allow for canonical chain name ?
            // Check for field existence using 'in' operator to support falsy values including explicit undefined
            const accountForNetwork = environmentName in accountDef
                ? accountDef[environmentName]
                : chainId in accountDef
                    ? accountDef[chainId]
                    : 'default' in accountDef
                        ? accountDef['default']
                        : undefined;
            if (accountForNetwork !== undefined) {
                const accountFetched = await getAccount(name, accounts, accountForNetwork);
                if (accountFetched) {
                    accountCache[name] = account = accountFetched;
                }
            }
        }
        return account;
    }
    if (userConfig.accounts) {
        const accountNames = Object.keys(userConfig.accounts);
        for (const accountName of accountNames) {
            const account = await getAccount(accountName, userConfig.accounts, userConfig.accounts[accountName]);
            if (!account) {
                throw new Error(`cannot get account for ${accountName} = ${JSON.stringify(userConfig.accounts[accountName], null, 2)}\nEnsure your provider (or hardhat) has some accounts set up for ${environmentName}\n`);
            }
            resolvedAccounts[accountName] = account;
        }
    }
    const resolvedData = {};
    async function getData(name, dataDef) {
        // Check for field existence using 'in' operator to support falsy values including explicit undefined
        const dataForNetwork = environmentName in dataDef
            ? dataDef[environmentName]
            : chainId in dataDef
                ? dataDef[chainId]
                : 'default' in dataDef
                    ? dataDef['default']
                    : undefined;
        return dataForNetwork;
    }
    if (userConfig.data) {
        logger.debug(`getting data for env = ${environmentName}, chainId = ${chainId}`);
        const dataFields = Object.keys(userConfig.data);
        for (const dataField of dataFields) {
            let fieldData = await getData(dataField, userConfig.data[dataField]);
            resolvedData[dataField] = fieldData;
        }
    }
    const context = {
        accounts: resolvedAccounts,
        data: resolvedData,
        fork: resolvedExecutionParams.environment.fork,
        saveDeployments,
        tags: networkTags,
        autoMine: resolvedExecutionParams.environment.autoMine,
    };
    const { deployments, migrations } = await loadDeployments(deploymentStore, deploymentsFolder, environmentName, false, context.fork
        ? undefined
        : {
            chainId,
            genesisHash,
            deleteDeploymentsIfDifferentGenesisHash: true,
        });
    const namedAccounts = {};
    const namedSigners = {};
    const addressSigners = {};
    for (const entry of Object.entries(resolvedAccounts)) {
        const name = entry[0];
        const { address, ...namedSigner } = entry[1];
        namedAccounts[name] = address;
        addressSigners[address] = namedSigner;
        namedSigners[name] = namedSigner;
    }
    const unnamedAccounts = allRemoteAccounts.filter((v) => !addressSigners[v]);
    for (const account of unnamedAccounts) {
        addressSigners[account] = {
            type: 'remote',
            signer: provider,
        };
    }
    // Identify unknown accounts (addresses in namedAccounts not in allRemoteAccounts)
    const unknownAccounts = Object.values(namedAccounts).filter((address) => !allRemoteAccounts.map((a) => a.toLowerCase()).includes(address.toLowerCase()));
    // Impersonate unknown accounts if enabled
    if (unknownAccounts.length > 0) {
        const impersonatedAccounts = await impersonateAccounts(rawProvider, unknownAccounts, resolvedExecutionParams.environment.autoImpersonate);
        if (impersonatedAccounts.length > 0) {
            logger.debug(`Auto-impersonated ${impersonatedAccounts.length} account(s): ${impersonatedAccounts.join(', ')}`);
        }
    }
    const perliminaryEnvironment = {
        context: {
            saveDeployments: context.saveDeployments,
            autoMine: context.autoMine,
        },
        name: environmentName,
        tags: context.tags,
        deployments: deployments,
        namedAccounts: namedAccounts,
        data: resolvedData,
        namedSigners: namedSigners,
        unnamedAccounts,
        addressSigners: addressSigners,
        network: {
            chain: resolvedExecutionParams.chain,
            fork: context.fork,
            provider,
            deterministicDeployment: resolvedExecutionParams.environment.deterministicDeployment,
            // for backward compatibility
            tags: context.tags,
        },
        extra: resolvedExecutionParams.extra || {},
    };
    // const signer = {
    // 	async sendTransaction(
    // 		provider: EIP1193ProviderWithoutEvents,
    // 		account: {
    // 			addresss: EIP1193Account;
    // 			config: unknown;
    // 		},
    // 		transaction: EIP1193TransactionEIP1193DATA
    // 	): Promise<EIP1193DATA> {
    // 		return '0x';
    // 	},
    // };
    // async function sendTransaction(transaction: EIP1193TransactionEIP1193DATA): Promise<EIP1193DATA> {
    // 	return '0x';
    // }
    function get(name) {
        const deployment = deployments[name];
        if (!deployment) {
            throw new Error(`no deployment named "${name}" found.`);
        }
        return deployment;
    }
    function getOrNull(name) {
        return (deployments[name] || null);
    }
    function hasMigrationBeenDone(id) {
        return migrations[id] ? true : false;
    }
    function recordMigration(id) {
        migrations[id] = Math.floor(Date.now() / 1000);
        if (context.saveDeployments) {
            deploymentStore.writeFileWithChainInfo({ chainId, genesisHash }, deploymentsFolder, environmentName, '.migrations.json', JSON.stringify(migrations));
        }
    }
    function fromAddressToNamedABIOrNull(address) {
        let list = [];
        for (const name of Object.keys(deployments)) {
            const deployment = deployments[name];
            if (deployment.address.toLowerCase() == address.toLowerCase()) {
                list.push({ name, artifact: deployment });
            }
        }
        if (list.length === 0) {
            return null;
        }
        const { mergedABI } = mergeArtifacts(list);
        return {
            mergedABI: mergedABI,
            names: list.map((v) => v.name),
        };
    }
    function fromAddressToNamedABI(address) {
        const n = fromAddressToNamedABIOrNull(address);
        if (!n) {
            throw new Error(`could not find artifact for address ${address}`);
        }
        return n;
    }
    async function save(name, deployment, options) {
        if (!options?.doNotCountAsNewDeployment) {
            let numDeployments = 1;
            const oldDeployment = deployments[name];
            if (oldDeployment) {
                numDeployments = (oldDeployment.numDeployments || 1) + 1;
            }
            deployments[name] = { ...deployment, numDeployments };
        }
        else {
            deployments[name] = { ...deployment, numDeployments: 1 };
        }
        if (context.saveDeployments) {
            deploymentStore.writeFileWithChainInfo({ chainId, genesisHash }, deploymentsFolder, environmentName, `${name}.json`, JSONToString(deployment, 2));
        }
        return deployment;
    }
    async function recoverTransactionsIfAny() {
        if (!context.saveDeployments) {
            return;
        }
        let existingPendingTansactions;
        try {
            existingPendingTansactions = stringToJSON(await deploymentStore.readFile(deploymentsFolder, environmentName, '.pending_transactions.json'));
        }
        catch {
            existingPendingTansactions = [];
        }
        if (existingPendingTansactions.length > 0) {
            while (existingPendingTansactions.length > 0) {
                const pendingTransaction = existingPendingTansactions.shift();
                if (pendingTransaction) {
                    if (pendingTransaction.type === 'deployment') {
                        const spinner = spin(`recovering ${pendingTransaction.name} with transaction ${pendingTransaction.transaction.hash}`);
                        try {
                            await waitForDeploymentTransactionAndSave(pendingTransaction);
                            await deploymentStore.writeFileWithChainInfo({ chainId, genesisHash }, deploymentsFolder, environmentName, '.pending_transactions.json', JSONToString(existingPendingTansactions, 2));
                            spinner.succeed();
                        }
                        catch (e) {
                            spinner.fail();
                            throw e;
                        }
                    }
                    else {
                        const spinner = spin(`recovering execution's transaction ${pendingTransaction.transaction.hash}`);
                        const transaction = await provider.request({
                            method: 'eth_getTransactionByHash',
                            params: [pendingTransaction.transaction.hash],
                        });
                        try {
                            await waitForTransaction(pendingTransaction.transaction.hash, {
                                transaction: transaction,
                                message: `  tx: {hash}\n      {transaction}`,
                            });
                            await deploymentStore.writeFileWithChainInfo({ chainId, genesisHash }, deploymentsFolder, environmentName, '.pending_transactions.json', JSONToString(existingPendingTansactions, 2));
                            spinner.succeed();
                        }
                        catch (e) {
                            spinner.fail();
                            throw e;
                        }
                    }
                }
            }
            await deploymentStore.deleteFile(deploymentsFolder, environmentName, '.pending_transactions.json');
        }
    }
    async function savePendingTransaction(pendingTransaction) {
        if (context.saveDeployments) {
            let existingPendinTransactions;
            try {
                existingPendinTransactions = stringToJSON(await deploymentStore.readFile(deploymentsFolder, environmentName, '.pending_transactions.json'));
            }
            catch {
                existingPendinTransactions = [];
            }
            existingPendinTransactions.push(pendingTransaction);
            await deploymentStore.writeFileWithChainInfo({ chainId, genesisHash }, deploymentsFolder, environmentName, '.pending_transactions.json', JSONToString(existingPendinTransactions, 2));
        }
        return deployments;
    }
    async function waitForTransactionReceipt(params) {
        const { hash, pollingInterval } = { pollingInterval: resolvedExecutionParams.pollingInterval, ...params };
        let receipt = null;
        try {
            receipt = await provider.request({
                method: 'eth_getTransactionReceipt',
                params: [hash],
            });
        }
        catch (err) { }
        if (!receipt || !receipt.blockHash) {
            await wait(pollingInterval);
            return waitForTransactionReceipt(params);
        }
        if (params.confirmations && params.confirmations > 1) {
            let confirmed = false;
            const latestBlockStr = await provider.request({
                method: 'eth_blockNumber',
            });
            if (latestBlockStr) {
                const latestBlockNumber = Number(latestBlockStr);
                const receiptBlockNumber = Number(receipt.blockNumber);
                if (latestBlockNumber - receiptBlockNumber > params.confirmations - 1) {
                    confirmed = true;
                }
            }
            if (!confirmed) {
                await wait(pollingInterval);
                return waitForTransactionReceipt(params);
            }
        }
        return receipt;
    }
    async function deleteTransaction(hash) {
        if (context.saveDeployments) {
            let existingPendinTransactions;
            try {
                existingPendinTransactions = stringToJSON(await deploymentStore.readFile(deploymentsFolder, environmentName, '.pending_transactions.json'));
            }
            catch {
                existingPendinTransactions = [];
            }
            existingPendinTransactions = existingPendinTransactions.filter((v) => v.transaction.hash !== hash);
            if (existingPendinTransactions.length === 0) {
                await deploymentStore.deleteFile(deploymentsFolder, environmentName, '.pending_transactions.json');
            }
            else {
                await deploymentStore.writeFileWithChainInfo({ chainId, genesisHash }, deploymentsFolder, environmentName, '.pending_transactions.json', JSONToString(existingPendinTransactions, 2));
            }
        }
    }
    async function waitForTransaction(hash, info) {
        let message = `  - Broadcasting tx:\n      ${hash}${info?.transaction ? `\n      ${displayTransaction(info?.transaction)}` : ''}`;
        if (info?.message) {
            message = info.message.replaceAll('{hash}', hash);
            if (info?.transaction) {
                message = message.replaceAll('{transaction}', displayTransaction(info.transaction));
            }
            else {
                message = message.replaceAll('{transaction}', '(tx not found)');
            }
        }
        const spinner = spin(message);
        let receipt;
        try {
            receipt = await waitForTransactionReceipt({
                hash,
                confirmations: resolvedExecutionParams.environment.confirmationsRequired,
            });
        }
        catch (e) {
            spinner.fail();
            throw e;
        }
        if (!receipt) {
            throw new Error(`receipt for ${hash} not found`);
        }
        else {
            spinner.succeed();
        }
        return receipt;
    }
    async function waitForDeploymentTransactionAndSave(pendingDeployment, info) {
        const nameToDisplay = pendingDeployment.name || '<no name>';
        let message = `  - Deploying ${nameToDisplay} with tx:\n      {hash}\n      {transaction}`;
        if (info?.message) {
            message = info.message.replaceAll('{name}', nameToDisplay);
        }
        const receipt = await waitForTransaction(pendingDeployment.transaction.hash, {
            transaction: info?.transaction,
            message,
        });
        // TODO we could make pendingDeployment.expectedAddress a spec for fetching address from event too
        const contractAddress = pendingDeployment.expectedAddress || receipt.contractAddress;
        if (!contractAddress) {
            console.error(receipt);
            throw new Error(`no contract address found for ${nameToDisplay}`);
        }
        showMessage(`    => ${contractAddress}`);
        const { abi, ...artifactObjectWithoutABI } = pendingDeployment.partialDeployment;
        if (!pendingDeployment.transaction.nonce) {
            // const spinner = spin(`fetching nonce for ${pendingDeployment.transaction.hash}`);
            let transaction = null;
            try {
                transaction = await provider.request({
                    method: 'eth_getTransactionByHash',
                    params: [pendingDeployment.transaction.hash],
                });
            }
            catch (e) {
                // spinner.fail(`failed to get transaction, even after receipt was found`);
                throw e;
            }
            if (!transaction) {
                // spinner.fail(`tx ${pendingDeployment.transaction.hash} not found,  even after receipt was found`);
                // or : spinner.stop();
            }
            else {
                // spinner.stop();
            }
            if (transaction) {
                pendingDeployment.transaction = {
                    nonce: transaction.nonce,
                    hash: transaction.hash,
                    origin: transaction.from,
                };
            }
        }
        // TODO options
        for (const key of Object.keys(artifactObjectWithoutABI)) {
            if (key.startsWith('_')) {
                delete artifactObjectWithoutABI[key];
            }
            if (key === 'evm') {
                if (artifactObjectWithoutABI.evm) {
                    if ('gasEstimates' in artifactObjectWithoutABI['evm']) {
                        const { gasEstimates } = artifactObjectWithoutABI.evm;
                        artifactObjectWithoutABI.evm = {
                            gasEstimates,
                        };
                    }
                }
            }
        }
        const deployment = {
            address: contractAddress,
            abi,
            ...artifactObjectWithoutABI,
            transaction: pendingDeployment.transaction,
            receipt: {
                blockHash: receipt.blockHash,
                blockNumber: receipt.blockNumber,
                transactionIndex: receipt.transactionIndex,
            },
        };
        if (pendingDeployment.name) {
            return save(pendingDeployment.name, deployment);
        }
        else {
            return deployment;
        }
    }
    async function broadcastTransaction(transaction) {
        if (transaction.type === 'raw') {
            const txHash = await env.network.provider.request({
                method: 'eth_sendRawTransaction',
                params: [transaction.raw],
            });
            if (env.context.autoMine) {
                await env.network.provider.request({ method: 'evm_mine', params: [] });
            }
            return txHash;
        }
        else {
            const transactionData = transaction.data;
            const from = transactionData.from.toLowerCase();
            const signer = env.addressSigners[from];
            if (!signer) {
                throw new Error(`cannot get signer for ${from}`);
            }
            if (signer.type === 'wallet' || signer.type === 'remote') {
                const txHash = await signer.signer.request({
                    method: 'eth_sendTransaction',
                    params: [transactionData],
                });
                if (env.context.autoMine) {
                    await env.network.provider.request({ method: 'evm_mine', params: [] });
                }
                return txHash;
            }
            else {
                const rawTx = await signer.signer.request({
                    method: 'eth_signTransaction',
                    params: [transactionData],
                });
                const txHash = await env.network.provider.request({
                    method: 'eth_sendRawTransaction',
                    params: [rawTx],
                });
                if (env.context.autoMine) {
                    await env.network.provider.request({ method: 'evm_mine', params: [] });
                }
                return txHash;
            }
        }
    }
    async function broadcastExecution(transaction, options) {
        const txHash = await broadcastTransaction(transaction);
        const from = transaction.type == 'raw' ? transaction.from : transaction.data.from;
        const pendingExecution = {
            type: 'execution',
            transaction: { hash: txHash, origin: from.toLowerCase() },
            // description, // TODO
            // TODO we should have the nonce, except for wallet like metamask where it is not sure you get the nonce you start with
        };
        return savePendingExecution(pendingExecution, options?.message);
    }
    async function savePendingExecution(pendingExecution, msg) {
        await savePendingTransaction(pendingExecution);
        let transaction = null;
        const spinner = spin(); // TODO spin(`fetching tx from peers ${pendingDeployment.txHash}`);
        try {
            transaction = await provider.request({
                method: 'eth_getTransactionByHash',
                params: [pendingExecution.transaction.hash],
            });
        }
        catch (e) {
            spinner.fail();
            throw e;
        }
        if (!transaction) {
            // spinner.fail(`execution tx ${pendingExecution.transaction.hash} not found in the mempool yet`);
            spinner.stop();
        }
        else {
            spinner.stop();
        }
        if (transaction) {
            pendingExecution.transaction.nonce = transaction.nonce;
            pendingExecution.transaction.origin = transaction.from.toLowerCase();
        }
        const receipt = await waitForTransaction(pendingExecution.transaction.hash, { transaction, message: msg });
        await deleteTransaction(pendingExecution.transaction.hash);
        return receipt;
    }
    async function broadcastDeployment(name, transaction, partialDeployment, options) {
        const txHash = await broadcastTransaction(transaction);
        const from = transaction.type == 'raw' ? transaction.from : transaction.data.from;
        const pendingDeployment = {
            name,
            type: 'deployment',
            expectedAddress: options?.expectedAddress,
            partialDeployment,
            transaction: { hash: txHash, origin: from.toLowerCase() },
            // TODO we should have the nonce, except for wallet like metamask where it is not sure you get the nonce you start with
        };
        return savePendingDeployment(pendingDeployment, options?.message);
    }
    async function savePendingDeployment(pendingDeployment, msg) {
        await savePendingTransaction(pendingDeployment);
        let transaction = null;
        const spinner = spin(); // TODO spin(`fetching tx from peers ${pendingDeployment.txHash}`);
        try {
            transaction = await provider.request({
                method: 'eth_getTransactionByHash',
                params: [pendingDeployment.transaction.hash],
            });
        }
        catch (e) {
            spinner.fail(`failed to fetch tx ${pendingDeployment.transaction.hash}. Can't know its status`);
            throw e;
        }
        if (!transaction) {
            // spinner.fail(`deployment tx ${pendingDeployment.transaction.hash} not found in the mempool yet`);
            spinner.stop();
        }
        else {
            spinner.stop();
        }
        if (transaction) {
            // we update the tx data with the one we get from the network
            pendingDeployment = {
                ...pendingDeployment,
                transaction: { hash: transaction.hash, nonce: transaction.nonce, origin: transaction.from },
            };
        }
        const deployment = await waitForDeploymentTransactionAndSave(pendingDeployment, { transaction, message: msg });
        await deleteTransaction(pendingDeployment.transaction.hash);
        return deployment;
    }
    function showMessage(message) {
        logger.log(message);
    }
    function showProgress(message) {
        return spin(message);
    }
    function resolveAccount(account) {
        if (account.startsWith('0x')) {
            return account.toLowerCase();
        }
        if (env.namedAccounts) {
            const address = env.namedAccounts[account];
            if (!address) {
                throw new Error(`no address for ${account}`);
            }
            return address.toLowerCase();
        }
        throw new Error(`no accounts setup, cannot get address for ${account}`);
    }
    function resolveAccountOrUndefined(account) {
        if (account.startsWith('0x')) {
            return account;
        }
        if (env.namedAccounts) {
            return env.namedAccounts[account];
        }
        return undefined;
    }
    let env = {
        ...perliminaryEnvironment,
        save,
        broadcastExecution,
        broadcastDeployment,
        get,
        getOrNull,
        fromAddressToNamedABI,
        fromAddressToNamedABIOrNull,
        showMessage,
        showProgress,
        hasMigrationBeenDone,
        resolveAccount,
        resolveAccountOrUndefined,
    };
    return {
        external: env,
        internal: {
            recoverTransactionsIfAny,
            recordMigration,
        },
    };
}
//# sourceMappingURL=index.js.map