#!/usr/bin/env node

import chalk from "chalk";
import { OpenAIChat } from "../lib/OpenAIChat.mjs";
import { parseArgs, printHelp, printVersion } from "../lib/parseArgs.mjs";
import { readFromPipe } from "../lib/readFromPipe.mjs";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import { parseUserMessage } from "../lib/parseUserMessage.mjs";
import blessed from "blessed";

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

  const chat = new OpenAIChat(args.prompt, args.interactive);

  /* Non-interactive mode */
  if (!args.interactive) {
    const assistantMessage = await chat
      .chat(args.message)
      .then(chat.sendMessage);
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

  // Build UI
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
  });
  screen.title = "AI - interactive mode";
  screen.key(["C-c", "C-d"], exit(screen));

  const box = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%-1",
    scrollable: true,
    alwaysScroll: true,
    mouse: true,
    content: args.message || "",
    tags: true,
    border: {
      type: "line",
    },
    style: {
      border: {
        fg: "gray",
      },
    },
  });

  const inputContainer = blessed.box({
    parent: screen,
    width: "100%",
    height: 1,
    bottom: 0,
    left: 0,
    scrollable: false,
    alwaysScroll: false,
    mouse: false,
  });

  const loading = blessed.loading({
    parent: screen,
    bottom: 2,
    left: 1,
    width: 1,
    height: 1,
    hidden: true,
  });

  blessed.box({
    parent: inputContainer,
    width: 1,
    height: 1,
    content: ">",
    bottom: 0,
    left: 0,
  });

  const input = blessed.textarea({
    parent: inputContainer,
    focusable: true,
    focused: true,
    inputOnFocus: true,
    width: "100%-4",
    height: 1,
    bottom: 0,
    left: 2,
    tags: true,
    style: {
      fg: "white",
    },
  });

  function render() {
    const conversation = chat.getConversation();
    box.setContent(
      conversation
        .map(({ role, content, usage }, idx) => {
          if (role === "user") {
            return buildUserContent(content, idx).trim();
          } else if (role === "assistant") {
            return buildAssistantContent(content, args.usage && usage).trim();
          } else {
            // Error
            return `{red-fg}${content}{red-fg}`;
          }
        })
        .join("\n")
    );
    // Scroll to bottom
    box.setScrollPerc(100);
    screen.render();
  }

  input.key("enter", async () => {
    const val = input.value.trim();

    const userIntent = parseUserMessage(val);

    let chatAction;
    if (userIntent.intent === "edit") {
      chatAction = chat.edit(userIntent.index, userIntent.message);
    } else {
      chatAction = chat.chat(val);
    }

    input.setValue("");
    input.hide();
    loading.load();

    chatAction
      .then(render)
      .then(chat.sendMessage)
      .finally(() => {
        render();
        input.show();
        input.focus();
        loading.stop();
      });
  });

  input.key("C-c", exit(screen));
  input.key("C-d", exit(screen));

  screen.key("e", function () {
    input.readInput();
  });

  if (args.message) {
    input.hide();
    loading.load();
    chat
      .chat(args.message.trim())
      .then(render)
      .then(chat.sendMessage)
      .finally(() => {
        render();
        input.show();
        input.focus();
        loading.stop();
      });
  } else {
    render();
    input.focus();
  }
}

main();

function buildUserContent(content, idx) {
  return `{right}{gray-fg}Type "\/e${idx} [new message]" to edit this message{/gray-fg}
{#00ff7f-fg}You{/#00ff7f-fg}:
{white-fg}${content.trim()}{/white-fg}{/right}`;
}

function buildAssistantContent(content, usage) {
  const usageInfo = usage
    ? `{gray-fg}(Prompt tokens: ${usage.prompt_tokens}, Completion tokens: ${usage.completion_tokens}, Total tokens: ${usage.total_tokens}){/gray-fg}
`
    : "";
  return (
    usageInfo +
    `{#00bfff-fg}Assistant{/#00ff7f-fg}:
${marked(content.trim())}`
  );
}

function exit(screen) {
  return function () {
    screen.destroy();
    return process.exit(0);
  };
}
