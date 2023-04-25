#!/usr/bin/env node

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import { OpenAIChat } from "../lib/OpenAIChat.mjs";
import { parseArgs, printHelp, printVersion } from "../lib/parseArgs.mjs";
import { readFromPipe } from "../lib/readFromPipe.mjs";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";

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
    printVersion();
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

  // Interactive mode
  if (args.interactive) {
    const rl = readline.createInterface({ input, output });
    rl.on("close", () => {
      prettyPrint(`\nBye!`);
      process.exit(0);
    });

    let userMessage = args.message,
      assistantMessage;

    if (!userMessage) {
      userMessage = await rl.question("> ");
    }

    assistantMessage = await chat.startNewChat(userMessage);

    while (true) {
      prettyPrint(assistantMessage);
      // Read another message
      userMessage = await rl.question("> ");
      assistantMessage = await chat.continueChat(userMessage);
    }
  } else {
    // Non-interactive mode
    const assistantMessage = await chat.startNewChat(args.message);
    prettyPrint(assistantMessage);
  }
}

function prettyPrint(output) {
  log(marked(output));
}

main();
