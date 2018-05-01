import { spawn, ChildProcess } from "child_process";
import { join } from "path";

const log = console.log.bind(console, "(integration-server)");
const err = console.error.bind(console, "(integration-server)");

const readyMessage = "｢wdm｣: Compiled successfully.";
let child: ChildProcess;

export const start = () => {
  log("starting...");
  return new Promise((resolve, reject) => {
    child = spawn("npm", ["run", "start"]);
    child.on("error", e => {
      err("child process error", e);
      reject(e);
    });
    child.stdout.on("data", data => {
      if (data && data.toString().indexOf(readyMessage) > -1) {
        log("ready.");
        resolve();
      }
    });
    child.stderr.on("data", data => {
      err("stderr", data.toString());
    });
    child.on("exit", code => {
      log(`stopped with exit code ${code}.`);
    });
  });
};

export const stop = () => {
  log("stopping...");
  return new Promise((resolve, reject) => {
    try {
      child.kill();
    } finally {
      resolve();
    }
  });
};
