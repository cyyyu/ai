import chalk from "chalk";
import OpenAI from "openai";
import ora from "ora";
import process from "node:process";

const DEFAULT_SYSTEM_CONTEXT =
  "Assistant is a large language model trained by OpenAI.";

export class OpenAIChat {
  constructor(isInteractiveMode, rolePrompt, commandPrompt) {
    const AZURE_API_BASE = process.env.AZURE_API_BASE;
    const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
    const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;
    const AZURE_API_VERSION =
      process.env.AZURE_API_VERSION || "2025-01-01-preview";

    if (!AZURE_API_BASE || !AZURE_OPENAI_API_KEY || !AZURE_OPENAI_DEPLOYMENT) {
      console.error(
        chalk.red(
          "Please set AZURE_API_BASE, AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT."
        )
      );
      process.exit(1);
    }

    const baseURL = new URL(
      `openai/deployments/${AZURE_OPENAI_DEPLOYMENT}`,
      AZURE_API_BASE.replace(/\/?$/, "/")
    ).href;

    const REQUEST_TIMEOUT_MS = 30 * 1000;

    const customFetch = (url, init = {}) => {
      const u = new URL(url);
      u.searchParams.set("api-version", AZURE_API_VERSION);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
      );
      if (init.signal) {
        init.signal.addEventListener("abort", () => controller.abort());
      }

      return fetch(u.toString(), {
        ...init,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    };

    this._client = new OpenAI({
      baseURL,
      apiKey: AZURE_OPENAI_API_KEY,
      fetch: customFetch,
    });
    this._model = AZURE_OPENAI_DEPLOYMENT;
    this._initialContext = {
      role: "system",
      content: rolePrompt || DEFAULT_SYSTEM_CONTEXT,
    };
    this._spinner =
      !isInteractiveMode &&
      ora({
        text: "...",
        discardStdin: false,
      });
    this.chatId = "";
    this.currentConversation = [this._initialContext];
    if (commandPrompt) {
      this._hasCommandPrompt = Boolean(commandPrompt);
      this.currentConversation.push({
        role: "user",
        content: commandPrompt,
      });
    }

    this.error = "";
  }

  chat = async (userMessage) => {
    this.currentConversation.push({ role: "user", content: userMessage });
    return this;
  };

  edit = async (idx, newMessage) => {
    const skipCount = this._hasCommandPrompt ? 2 : 1;
    let i = skipCount;
    for (; i < this.currentConversation.length; i++) {
      if (this.currentConversation[i].role === "user") {
        if (idx === 0) {
          this.currentConversation[i].content = newMessage;
          break;
        }
        idx--;
      }
    }

    this.currentConversation = this.currentConversation.slice(0, i + 1);

    return this;
  };

  sendMessage = async () => {
    const response = await this._sendCompletionRequest();
    this.chatId = response.id ?? "";
    return this.currentConversation[this.currentConversation.length - 1];
  };

  getConversation() {
    return this.currentConversation.slice(this._hasCommandPrompt ? 2 : 1);
  }

  async _sendCompletionRequest() {
    if (process.env.NODE_ENV === "test") {
      this.currentConversation.push({
        role: "assistant",
        content: "Test response",
        usage: {
          prompt_tokens: 58,
          completion_tokens: 68,
          total_tokens: 126,
        },
      });

      this._spinner && this._spinner.start();

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      this._spinner && this._spinner.stop();

      return Promise.resolve({
        id: "chatcmpl-6v7mkQj980V1yBec6ETrKPRqFjNw9",
      });
    }

    const conversation = this.currentConversation.map((message) => {
      const { usage, ...rest } = message;
      return rest;
    });

    this._spinner && this._spinner.start();
    try {
      const completion = await this._client.chat.completions.create({
        model: this._model,
        messages: conversation,
      });

      this.currentConversation.push({
        ...completion.choices[0].message,
        usage: completion.usage,
      });
      this._spinner && this._spinner.stop();
      this.error = "";
      return completion;
    } catch (err) {
      if (err.name === "AbortError") {
        this.error = "Timed out. Type '/r' to retry.";
      } else if (err instanceof Error) {
        this.error = err.message;
      }
      this._spinner && this._spinner.stop();
      this.currentConversation.push({
        role: "error",
        content: "Something went wrong. Please try again.",
      });
      throw err;
    }
  }
}
