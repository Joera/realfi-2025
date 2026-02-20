import { setupDeployScripts } from "rocketh";
import { extensions, namedAccounts } from "./config.js";

export const { deployScript, loadArtifacts } = setupDeployScripts({
  extensions,
  namedAccounts,
});

export const artifacts = await loadArtifacts();