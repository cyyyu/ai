import commandLineArgs from "command-line-args";

export function parseArgs() {
  const optionDefinitions = [
    { name: "help", alias: "h", type: Boolean },
    { name: "message", alias: "m", type: String, defaultOption: true },
    { name: "interactive", alias: "i", type: Boolean },
    { name: "prompt", alias: "p", type: String },
  ];
  const options = commandLineArgs(optionDefinitions);
  return options;
}
