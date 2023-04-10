#!/usr/bin/env node

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import { OpenAIChat } from "../lib/OpenAIChat.mjs";
import { parseArgs } from "../lib/parseArgs.mjs";

const log = console.log;

async function main() {
  const args = parseArgs();

  if (args.help || (!args.message && !args.interactive)) {
    log("Usage: ai [options] [message]");
    log("Options:");
    log("  -h, --help         Show this help message.");
    log("  -m, --message      Message to send to the assistant.");
    log("  -i, --interactive  Start an interactive chat session.");
    log("  -p, --prompt       Prompt to use for the assistant.");
    return;
  }
  const chat = new OpenAIChat(args.prompt);

  // Interactive mode
  if (args.interactive) {
    const rl = readline.createInterface({ input, output });
    rl.on("close", () => {
      log(chalk.green`\nBye!`);
      process.exit(0);
    });

    let userMessage = args.message,
      assistantMessage;

    if (!userMessage) {
      userMessage = await rl.question(">> ");
    }

    assistantMessage = await chat.startNewChat(userMessage);

    while (true) {
      log(chalk.green(assistantMessage));
      // Read another message
      userMessage = await rl.question(">> ");
      assistantMessage = await chat.continueChat(userMessage);
    }
  } else {
    // Non-interactive mode
    const assistantMessage = await chat.startNewChat(args.message);
    log(chalk.green(assistantMessage));
  }
}

main();
