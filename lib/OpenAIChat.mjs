import chalk from "chalk";
import fetch from "node-fetch";
import ora from "ora";
import process from "node:process";

const DEFAULT_SYSTEM_CONTEXT =
  "Assistant is a large language model trained by OpenAI.";

export class OpenAIChat {
  constructor(isInteractiveMode, rolePrompt, commandPrompt) {
    const OPENAI_API_BASE = process.env.OPENAI_API_BASE;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_API_MODEL_NAME = process.env.OPENAI_API_MODEL_NAME;

    // Make sure OPENAI_API_BASE and OPENAI_API_KEY are set
    if (!OPENAI_API_BASE || !OPENAI_API_KEY || !OPENAI_API_MODEL_NAME) {
      console.error(
        chalk.red(
          "Please set OPENAI_API_BASE, OPENAI_API_KEY and OPENAI_API_MODEL_NAME."
        )
      );
      process.exit(1);
    }

    this._apiKey = OPENAI_API_KEY;
    this._url = `${OPENAI_API_BASE}/openai/deployments/${OPENAI_API_MODEL_NAME}/chat/completions?api-version=2023-05-15`;
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

    // Error handling
    this.error = "";
    this.controller = new AbortController();
    const { signal } = this.controller;
  }

  chat = async (userMessage) => {
    this.currentConversation.push({ role: "user", content: userMessage });
    return this;
  };

  edit = async (idx, newMessage) => {
    // idx is the index of the user's message, not the assistant's
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

    // Clear message after idx
    this.currentConversation = this.currentConversation.slice(0, i + 1);

    return this;
  };

  sendMessage = async () => {
    const response = await this._sendCompletionRequest();
    this.chatId = response.id;
    return this.currentConversation[this.currentConversation.length - 1];
  };

  getConversation() {
    // Skip the prompts
    return this.currentConversation.slice(this._hasCommandPrompt ? 2 : 1);
  }

  // Send a chat completion request to the OpenAI API
  // Sample response:
  // {
  //   "id": "chatcmpl-6v7mkQj980V1yBec6ETrKPRqFjNw9",
  //   "object": "chat.completion",
  //   "created": 1679072642,
  //   "model": "gpt-35-turbo",
  //   "usage": {
  //     "prompt_tokens": 58,
  //     "completion_tokens": 68,
  //     "total_tokens": 126
  //   },
  //   "choices": [
  //     {
  //       "message": {
  //         "role": "assistant",
  //         "content": "Yes, other Azure Cognitive Services also support customer managed keys. Azure Cognitive Services offer multiple options for customers to manage keys, such as using Azure Key Vault, customer-managed keys in Azure Key Vault or customer-managed keys through Azure Storage service. This helps customers ensure that their data is secure and access to their services is controlled."
  //       },
  //       "finish_reason": "stop",
  //       "index": 0
  //     }
  //   ]
  // }
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

    const headers = {
      "Content-Type": "application/json",
      "api-key": this._apiKey,
    };
    // Remove 'usage' from the request body before sending
    const conversation = this.currentConversation.map((message) => {
      const { usage, ...rest } = message;
      return rest;
    });

    const body = { messages: conversation };

    const { signal } = this.controller;

    const timer = setTimeout(() => {
      this.controller.abort();
    }, 8000);

    this._spinner && this._spinner.start();
    try {
      const response = await fetch(this._url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
        signal,
      });
      if (!response.ok) {
        this.currentConversation.push({
          role: "error",
          content: "Something went wrong. Please try again.",
        });

        throw new Error(
          "Failed to send completion request." + response.statusText
        );
      }

      const json = await response.json();

      this.currentConversation.push({
        ...json.choices[0].message,
        usage: json.usage,
      });
      this._spinner && this._spinner.stop();
      this.error = "";
      clearTimeout(timer);
      return json;
    } catch (err) {
      if (err.name === "AbortError") {
        this.error = "Timed out.";
      } else if (err instanceof Error) {
        this.error = err.message;
      }
      this._spinner && this._spinner.stop();
      return err;
    }
  }
}
