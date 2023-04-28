import chalk from "chalk";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";

marked.setOptions({
  renderer: new TerminalRenderer(),
});

export class Term {
  constructor() {
    this._cache = "";
    console.clear();
    this._rl = readline.createInterface({ input, output });
    this._rl.on("close", () => {
      this._write(chalk.bold("\nGoodbye!"));
      process.exit(0);
    });
  }

  async prompt(idx = 0) {
    const userInput = await this._rl.question("> ");

    const prefix = chalk.bold(
      chalk.cyan("You") + `: ${chalk.dim(`[${idx}]`)}\n> `
    );
    this._write(prefix + userInput);

    return userInput;
  }

  async answer(assistantMessage, usageInfo) {
    const response =
      "\n" +
      chalk.bold(chalk.greenBright("Assistant") + ": ") +
      usageInfo +
      "\n" +
      marked(assistantMessage).trim() +
      "\n";
    this._write(response);
  }

  _write(str) {
    this._cache += str;
    this._flush();
  }

  _flush() {
    console.clear();
    console.log(this._cache);
  }
}
