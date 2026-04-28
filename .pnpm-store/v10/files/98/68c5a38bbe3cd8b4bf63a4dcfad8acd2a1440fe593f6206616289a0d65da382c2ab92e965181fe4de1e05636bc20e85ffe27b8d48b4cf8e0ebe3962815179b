import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
export const MIGRATION_URL = 'https://rocketh.dev/hardhat-deploy/migration-from-v1';
export const V1_INSTALL_CMD = 'npm install hardhat-deploy@1';
export function detectV1Patterns(projectRoot = process.cwd()) {
    const reasons = [];
    // Check hardhat.config for v1 patterns
    const configPatterns = checkConfigPatterns(projectRoot);
    reasons.push(...configPatterns);
    // Check deploy scripts for v1 patterns
    const deployPatterns = checkDeployScripts(projectRoot);
    reasons.push(...deployPatterns);
    return {
        isV1Environment: reasons.length > 0,
        reasons,
    };
}
function checkConfigPatterns(projectRoot) {
    const reasons = [];
    const configFiles = ['hardhat.config.js', 'hardhat.config.ts'];
    for (const configFile of configFiles) {
        const configPath = join(projectRoot, configFile);
        if (existsSync(configPath)) {
            try {
                const content = readFileSync(configPath, 'utf-8');
                if (content.includes('namedAccounts')) {
                    reasons.push(`Found 'namedAccounts' in ${configFile} - this is a v1 pattern. In v2, use rocketh/config.ts`);
                }
                if (content.includes("require('hardhat-deploy')") || content.includes('require("hardhat-deploy")')) {
                    reasons.push(`Found require('hardhat-deploy') in ${configFile} - v2 uses ESM: import HardhatDeploy from 'hardhat-deploy'`);
                }
                if (content.includes('module.exports')) {
                    reasons.push(`Found 'module.exports' in ${configFile} - v2 uses ESM: export default defineConfig({...})`);
                }
                // Check for old solidity config (non-profile based)
                if (content.match(/solidity:\s*['"][0-9]/) || content.match(/solidity:\s*\{\s*version:/)) {
                    reasons.push(`Found old-style solidity config in ${configFile} - v2 uses profiles: solidity: { profiles: { default: { version: '...' } } }`);
                }
            }
            catch (e) {
                // Failed to read config - continue
            }
        }
    }
    return reasons;
}
function checkDeployScripts(projectRoot) {
    const reasons = [];
    const deployDir = join(projectRoot, 'deploy');
    if (!existsSync(deployDir)) {
        return reasons;
    }
    try {
        const files = readdirSync(deployDir);
        for (const file of files) {
            if (file.endsWith('.js') || file.endsWith('.ts')) {
                const filePath = join(deployDir, file);
                try {
                    const content = readFileSync(filePath, 'utf-8');
                    if (content.includes('module.exports') && content.includes('getNamedAccounts')) {
                        reasons.push(`Found v1-style deploy script: deploy/${file} - v2 uses: export default deployScript(async ({deploy, namedAccounts}) => {...})`);
                        break; // One example is enough
                    }
                    if (content.includes('deployments.deploy')) {
                        reasons.push(`Found 'deployments.deploy()' in deploy/${file} - v2 uses 'deploy()' directly with artifact parameter`);
                        break;
                    }
                    if (content.includes('from:') && !content.includes('account:')) {
                        reasons.push(`Found 'from:' parameter in deploy/${file} - v2 uses 'account:' instead`);
                        break;
                    }
                }
                catch (e) {
                    // Failed to read file - continue
                }
            }
        }
    }
    catch (e) {
        // Deploy folder scan failed - continue silently
    }
    return reasons;
}
export class V1PatternError extends Error {
    constructor(reasons) {
        const reasonsList = reasons.map((r) => `  • ${r}`).join('\n');
        super(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  HARDHAT-DEPLOY V2 - V1 PATTERNS DETECTED                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

Your project uses hardhat-deploy v1 patterns that are incompatible with v2:

${reasonsList}

hardhat-deploy v2 has MAJOR breaking changes and requires hardhat 3.x with a
different configuration structure.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION 1: Install v1 instead (recommended for existing v1 projects)

  npm uninstall hardhat-deploy
  ${V1_INSTALL_CMD}

OPTION 2: Migrate your project to v2

  Migration guide: ${MIGRATION_URL}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
        this.name = 'V1PatternError';
    }
}
export function throwV1MigrationError(reasons) {
    throw new V1PatternError(reasons);
}
//# sourceMappingURL=v1-detection.js.map