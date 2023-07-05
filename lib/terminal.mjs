import chalk from "chalk";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import ansiEscapes from "ansi-escapes";

marked.setOptions({
  renderer: new TerminalRenderer(),
});

export class Term {
  constructor() {
    this._rl = readline.createInterface({
      input: stdin,
      output: stdout,
      terminal: true,
    });
    this._rl.on("close", () => {
      stdout.write(ansiEscapes.exitAlternativeScreen);
      process.exit(0);
    });
    stdout.write(ansiEscapes.enterAlternativeScreen);
    stdout.write(ansiEscapes.cursorTo(0, 0));
  }

  async prompt(defaultInput = "") {
    const userInput =
      defaultInput || (await this._rl.question(chalk.bold("> ")));
    return userInput;
  }

  /**
   * @param {Array<{
   * role: "user" | "assistant",
   * content: string,
   * usage: {
   *   prompt_tokens: 0,
   *   completion_tokens: 0,
   *   total_tokens: 0,
   *   }
   * }>} messages
   **/
  printConversation(messages, showUsage) {
    let idx = 0;
    let message = messages.reduce((acc, message) => {
      const role = message.role === "user" ? "You" : "Assistant";
      const color = message.role === "user" ? "cyan" : "greenBright";
      const prefix = chalk.bold(chalk[color](role) + ": ");
      const usage = showUsage && message.usage;
      const postfix =
        (message.role === "user"
          ? chalk.dim(`Type "\/e${idx} [new message]" to edit this message`)
          : usage
            ? chalk.dim(
              `(Prompt tokens: ${usage.prompt_tokens}, Completion tokens: ${usage.completion_tokens}, Total tokens: ${usage.total_tokens})`
            )
            : "") + "\n";
      const content =
        message.role === "assistant"
          ? marked(message.content).trim()
          : message.content;
      if (message.role === "user") idx++;

      return acc + prefix + postfix + content + "\n";
    }, "");

    this._flush(message);
  }

  _flush(msg) {
    stdout.write(ansiEscapes.clearTerminal);
    console.log(msg);
  }
}
