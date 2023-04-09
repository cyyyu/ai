#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { OpenAIChat } from "../lib/OpenAIChat.mjs";

async function main() {
  const optionDefinitions = [
    { name: "help", alias: "h", type: Boolean },
    { name: "message", alias: "m", type: String, defaultOption: true },
    { name: "interactive", alias: "i", type: Boolean },
  ];
  const options = commandLineArgs(optionDefinitions);

  if (options.help || (!options.message && !options.interactive)) {
    console.log("Usage: ai [options] [message]");
    console.log("Options:");
    console.log("  -h, --help     Show this help message.");
    console.log("  -m, --message  Message to send to the assistant.");
    console.log("  -i, --interactive  Start an interactive chat session.");
    return;
  }

  const chat = new OpenAIChat();

  // Interactive mode
  if (options.interactive) {
    const rl = readline.createInterface({ input, output });
    rl.on("close", () => {
      // Print the assistant's message and color it green
      console.log("\n\x1b[32m%s\x1b[0m", `Assistant: Bye!`);
      process.exit(0);
    });

    let userMessage = options.message,
      assistantMessage;

    if (!userMessage) {
      userMessage = await rl.question("You: ");
    }

    assistantMessage = await chat.startNewChat(userMessage);

    while (true) {
      // Print the assistant's message and color it green
      console.log("\x1b[32m%s\x1b[0m", `Assistant: ${assistantMessage}`);
      // Read another message from the user using
      userMessage = await rl.question("You: ");
      assistantMessage = await chat.continueChat(userMessage);
    }
  } else {
    // Non-interactive mode
    const assistantMessage = await chat.startNewChat(options.message);
    // Print the assistant's message and color it green
    console.log("\x1b[32m%s\x1b[0m", `Assistant: ${assistantMessage}`);
  }
}

main();
