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

  if (args.help) {
    printHelp();
    return;
  }

  if (args.version) {
    await printVersion();
    return;
  }

  if (!args.message) {
    args.message = await readFromPipe();
    if (!args.message && !args.interactive) {
      printHelp();
      return;
    }
  }

  const chat = new OpenAIChat(args.prompt);

  if (!args.interactive) {
    // Non-interactive mode
    const assistantMessage = await chat.startNewChat(args.message);
    log(marked(assistantMessage).trim());
    if (args.usage) {
      const usage = chat.getUsage();
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

  // Interactive mode
  const term = new Term();

  let userMessage = args.message || (await term.prompt());
  let assistantMessage = await chat.startNewChat(userMessage);

  while (true) {
    // Usage info in one line
    // With the color slightly dimmed
    let usageInfo = "";
    if (args.usage) {
      const usage = chat.getUsage();
      usageInfo = chalk.dim(
        `(Prompt tokens: ${usage.prompt_tokens}, Completion tokens: ${usage.completion_tokens}, Total tokens: ${usage.total_tokens})`
      );
    }

    term.answer(assistantMessage, usageInfo);

    // Read another message
    // Show prompt in this format: "You: [idx]"
    // With idx is dimmed
    const idx = chat.getNumOfUserMessages();
    userMessage = await term.prompt(idx);

    const userIntent = parseUserMessage(userMessage);
    if (userIntent.intent === "edit") {
      // Clear the screen under the message
      //const linesBelowMessage = getLinesBelowMessage(
      //chat.getNumOfUserMessages()
      //);
      //console.log(chalk.red(linesBelowMessage));
      //log(chalk.bold(`> `) + userIntent.message);
    }

    assistantMessage = await chat.continueChat(
      userIntent.message,
      userIntent.intent === "edit" ? userIntent.index : undefined
    );
  }
}

main();
