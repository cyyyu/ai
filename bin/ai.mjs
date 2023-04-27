#!/usr/bin/env node

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import { OpenAIChat } from "../lib/OpenAIChat.mjs";
import { parseArgs, printHelp, printVersion } from "../lib/parseArgs.mjs";
import { readFromPipe } from "../lib/readFromPipe.mjs";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import { parseUserMessage } from "../lib/parseUserMessage.mjs";

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
  const rl = readline.createInterface({ input, output });
  rl.on("close", () => {
    log(chalk.bold("\nGoodbye!"));
    process.exit(0);
  });

  let userMessage = args.message,
    assistantMessage;

  if (!userMessage) {
    userMessage = await rl.question(
      chalk.bold(`You: ${chalk.dim(`[0]`)}\n> `)
    );
  }

  assistantMessage = await chat.startNewChat(userMessage);

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

    log(chalk.bold("Assistant: ") + usageInfo);
    log(marked(assistantMessage).trim() + "\n");

    // Read another message
    // Show prompt in this format: "You: [idx]"
    // With idx is dimmed
    const idx = chat.getNumOfUserMessages();
    userMessage = await rl.question(
      chalk.bold(`You: ${chalk.dim(`[${idx}]`)}\n> `)
    );

    const userIntent = parseUserMessage(userMessage);

    assistantMessage = await chat.continueChat(
      userIntent.message,
      userIntent.intent === "edit" ? userIntent.index : undefined
    );
  }
}

main();
