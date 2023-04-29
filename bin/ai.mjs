#!/usr/bin/env node

import chalk from "chalk";
import { OpenAIChat } from "../lib/OpenAIChat.mjs";
import { parseArgs, printHelp, printVersion } from "../lib/parseArgs.mjs";
import { readFromPipe } from "../lib/readFromPipe.mjs";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import { parseUserMessage } from "../lib/parseUserMessage.mjs";
import { Term } from "../lib/terminal.mjs";

marked.setOptions({
  renderer: new TerminalRenderer(),
});

const log = console.log;

async function main() {
  const args = parseArgs();

  if (args.version) {
    await printVersion();
    return;
  }

  args.message = args.message || (await readFromPipe());

  if (args.help || (!args.message && !args.interactive)) {
    printHelp();
    return;
  }

  const chat = new OpenAIChat(args.prompt);

  /* Non-interactive mode */
  if (!args.interactive) {
    chat.startNewChat(args.message);
    const assistantMessage = await chat.ask();
    log(marked(assistantMessage.content).trim());
    if (args.usage) {
      const usage = assistantMessage.usage;
      log(
        chalk.bold(
          `\n${chalk.underline("Prompt tokens")}: ${
            usage.prompt_tokens
          }\n${chalk.underline("Completion tokens")}: ${
            usage.completion_tokens
          }\n${chalk.underline("Total tokens")}: ${usage.total_tokens}`
        )
      );
    }
    return;
  }

  /* Interactive mode */
  const term = new Term();

  let userMessage = await term.prompt(args.message);
  chat.startNewChat(userMessage);

  while (true) {
    term.printConversation(chat.getConversation(), args.usage);
    await chat.ask();
    term.printConversation(chat.getConversation(), args.usage);
    userMessage = await term.prompt();

    const userIntent = parseUserMessage(userMessage);
    if (userIntent.intent === "edit") {
      chat.editMessage(userIntent.index, userIntent.message);
    } else {
      chat.continueChat(userIntent.message);
    }
  }
}

main();
