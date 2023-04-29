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
    this._rl = readline.createInterface({ input, output });
    this._rl.on("close", () => {
      console.log(chalk.bold("\nGoodbye!"));
      process.exit(0);
    });
    console.clear();
  }

  async prompt(defaultInput = "") {
    const userInput = defaultInput || (await this._rl.question("> "));

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
  printConversation(messages) {
    let idx = 0;
    const message = messages.reduce((acc, message) => {
      const role = message.role === "user" ? "You" : "Assistant";
      const color = message.role === "user" ? "cyan" : "greenBright";
      const prefix = chalk.bold(chalk[color](role) + ": ");
      const usage = message.usage;
      const postfix =
        (message.role === "user"
          ? chalk.dim(`Use "\/e${idx} [message]" to edit this message`)
          : message.usage
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
    console.clear();
    console.log(msg);
  }
}
