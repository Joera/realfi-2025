import { deployScript, artifacts } from "../rocketh/deploy.js";

export default deployScript(
  async (env) => {
    const { deployer } = env.namedAccounts;

    await env.deploy("S3ntimentSurveyStore", {
      account: deployer,
      artifact: artifacts.S3ntimentSurveyStore,
      args: [],
    });
  },
  { tags: ["SurveyStore"] }
);