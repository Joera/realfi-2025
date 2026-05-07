import path from 'node:path';
import fs from 'node:fs';
export function createFSDeploymentStore() {
    function getFolder(deploymentsFolder, environmentName) {
        return path.join(deploymentsFolder, environmentName);
    }
    function getFile(deploymentsFolder, environmentName, name) {
        return path.join(deploymentsFolder, environmentName, name);
    }
    async function ensureChainInfoRecorded(deploymentsFolder, environmentName, chainId, genesisHash) {
        if (!(await hasFile(deploymentsFolder, environmentName, '.chain'))) {
            await writeFile(deploymentsFolder, environmentName, '.chain', JSON.stringify({ chainId, genesisHash }));
        }
    }
    async function writeFileWithChainInfo(chaininfo, deploymentsFolder, environmentName, name, content) {
        await ensureChainInfoRecorded(deploymentsFolder, environmentName, chaininfo.chainId, chaininfo.genesisHash);
        fs.mkdirSync(getFolder(deploymentsFolder, environmentName), { recursive: true });
        fs.writeFileSync(getFile(deploymentsFolder, environmentName, name), content);
    }
    async function writeFile(deploymentsFolder, environmentName, name, content) {
        fs.mkdirSync(getFolder(deploymentsFolder, environmentName), { recursive: true });
        fs.writeFileSync(getFile(deploymentsFolder, environmentName, name), content);
    }
    async function readFile(deploymentsFolder, environmentName, name) {
        return fs.readFileSync(getFile(deploymentsFolder, environmentName, name), 'utf-8');
    }
    async function deleteFile(deploymentsFolder, environmentName, name) {
        fs.unlinkSync(getFile(deploymentsFolder, environmentName, name));
    }
    async function listFiles(deploymentsFolder, environmentName) {
        return fs.readdirSync(getFolder(deploymentsFolder, environmentName));
    }
    async function hasFile(deploymentsFolder, environmentName, name) {
        return fs.existsSync(getFile(deploymentsFolder, environmentName, name));
    }
    async function deleteAll(deploymentsFolder, environmentName) {
        fs.rmSync(getFolder(deploymentsFolder, environmentName), { recursive: true, force: true });
    }
    return {
        writeFileWithChainInfo,
        listFiles,
        hasFile,
        deleteAll,
        readFile,
        writeFile,
        deleteFile,
    };
}
//# sourceMappingURL=deployment-store.js.map