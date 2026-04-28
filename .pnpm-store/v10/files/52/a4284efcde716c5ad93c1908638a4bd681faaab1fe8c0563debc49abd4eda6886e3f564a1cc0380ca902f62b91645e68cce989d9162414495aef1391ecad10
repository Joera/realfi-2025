#! /usr/bin/env node

import { exec, execFileSync } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const stripAnsi = (str: string) => str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, "");

// not supported yet
// import pkg from "../package.json" with { type: "json" };
// so use the following instead:
import { createRequire } from "module";
import { stderr } from "process";
const require = createRequire(import.meta.url);
const pkg = require("../package.json");

async function main() {
  const args = process.argv.slice(2);

  let sessionToLaunch: string | undefined;
  let attaching = false;
  for (const arg of args) {
    if (attaching) {
      sessionToLaunch = arg;
      attaching = false;
    } else {
      if (arg == "attach" || arg == "a") {
        attaching = true;
      }
    }
  }

  if (sessionToLaunch) {
    try {
      const { stdout, stderr } = await execAsync("zellij list-sessions");
      const lines = stdout.trim().split("\n");
      for (const lineWithAnsi of lines) {
        const line = stripAnsi(lineWithAnsi);
        const firstSpaceIndex = line.indexOf(" ");
        const session = line.substring(0, firstSpaceIndex);
        if (session == sessionToLaunch) {
          console.log(session);
          if (line.indexOf("(EXITED") >= 0) {
            console.log(`deleting session named "${session}"...`);
            await execAsync(`zellij delete-session ${session}`);
          }
        }
      }
    } catch (err: any) {
      if (
        err.stderr &&
        stripAnsi(err.stderr.trim()) == "No active zellij sessions found."
      ) {
      } else {
        throw err;
      }
    }
  }

  try {
    execFileSync("zellij", args, {
      stdio: "inherit",
    });
  } catch (err: any) {
    process.exit(err.status || 1);
  }
}

main();
