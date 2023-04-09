#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import { OpenAIChat } from "../lib/OpenAIChat.mjs";

const log = console.log;

async function main() {
  const optionDefinitions = [
    { name: "help", alias: "h", type: Boolean },
    { name: "message", alias: "m", type: String, defaultOption: true },
    { name: "interactive", alias: "i", type: Boolean },
  ];
  const options = commandLineArgs(optionDefinitions);

  if (options.help || (!options.message && !options.interactive)) {
    log("Usage: ai [options] [message]");
    log("Options:");
    log("  -h, --help     Show this help message.");
    log("  -m, --message  Message to send to the assistant.");
    log("  -i, --interactive  Start an interactive chat session.");
    return;
  }

  const chat = new OpenAIChat();

  // Interactive mode
  if (options.interactive) {
    const rl = readline.createInterface({ input, output });
    rl.on("close", () => {
      log(chalk.green`\nBye!`);
      process.exit(0);
    });

    let userMessage = options.message,
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
    const assistantMessage = await chat.startNewChat(options.message);
    log(chalk.green(assistantMessage));
  }
}

main();
