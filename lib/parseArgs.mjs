import commandLineArgs from "command-line-args";
import fs from "fs/promises";

export function parseArgs() {
  const optionDefinitions = [
    { name: "help", alias: "h", type: Boolean },
    { name: "message", alias: "m", type: String, defaultOption: true },
    { name: "interactive", alias: "i", type: Boolean },
    { name: "prompt", alias: "p", type: String },
    { name: "version", alias: "v", type: Boolean },
  ];
  const options = commandLineArgs(optionDefinitions);
  return options;
}

export function printHelp() {
  const log = console.log;
  log("Usage: ai [options] [message]");
  log("Options:");
  log("  -h, --help         Show this help message.");
  log("  -m, --message      Message to send to the assistant.");
  log("  -i, --interactive  Start an interactive chat session.");
  log("  -p, --prompt       Prompt to use for the assistant.");
  log("  -v, --version      Show the version number.");
}

export async function printVersion() {
  const data = await fs.readFile("./package.json", "utf8");
  const pkg = JSON.parse(data);
  console.log(pkg.version);
}
