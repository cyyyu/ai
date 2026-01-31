import chalk from "chalk";
import OpenAI from "openai";
import ora from "ora";
import process from "node:process";

const DEFAULT_SYSTEM_CONTEXT =
  "Assistant is a large language model trained by OpenAI.";

export class OpenAIChat {
  constructor(isInteractiveMode, rolePrompt, commandPrompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_DEPLOYMENT;
    const endpoint = process.env.OPENAI_ENDPOINT;

    if (!apiKey || !model) {
      console.error(
        chalk.red(
          "Please set OPENAI_API_KEY and OPENAI_DEPLOYMENT (model name)."
        )
      );
      process.exit(1);
    }

    const REQUEST_TIMEOUT_MS = 30 * 1000;
    const customFetch = (url, init = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
      );
      if (init.signal) {
        init.signal.addEventListener("abort", () => controller.abort());
      }
      return fetch(url, {
        ...init,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    };

    this._client = new OpenAI({
      ...(endpoint && { baseURL: endpoint }),
      apiKey,
      fetch: customFetch,
    });
    this._model = model;
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
