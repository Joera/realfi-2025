import { deploy } from "@rocketh/deploy";

export const extensions = (env: any) => ({
  deploy: deploy(env),
});

export const namedAccounts = {
  deployer: 0,
};