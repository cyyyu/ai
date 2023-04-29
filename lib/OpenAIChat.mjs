import chalk from "chalk";
import fetch from "node-fetch";
import ora from "ora";
import process from "node:process";

const DEFAULT_SYSTEM_CONTEXT =
  "Assistant is a large language model trained by OpenAI.";

export class OpenAIChat {
  constructor(prompt) {
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
    this._url = `${OPENAI_API_BASE}/openai/deployments/${OPENAI_API_MODEL_NAME}/chat/completions?api-version=2023-03-15-preview`;
    this._initialContext = {
      role: "system",
      content: prompt || DEFAULT_SYSTEM_CONTEXT,
    };
    this._spinner = ora({
      text: "...",
      discardStdin: false,
    });
    this._init();
  }

  startNewChat(userMessage) {
    this._init();
    this.currentConversation.push({ role: "user", content: userMessage });
  }

  continueChat(userMessage, idx) {
    // If idx is not provided, append to the end of the conversation
    // Otherwise, replace the message at idx.
    // It's only used to indexing the user's message, not the system's.
    if (typeof idx === "number") {
      let i = 0;
      while (idx > 0) {
        if (this.currentConversation[i].role === "user") {
          idx--;
          if (idx === 0) {
            this.currentConversation[i].content = userMessage;
            break;
          }
        }
        i++;
        if (i > this.currentConversation.length) {
          throw new Error("Invalid index.");
        }
      }
    } else {
      this.currentConversation.push({ role: "user", content: userMessage });
    }
  }

  async ask() {
    const response = await this._sendCompletionRequest();
    this.chatId = response.id;
    return response.choices[0].message.content.trim();
  }

  getConversation() {
    // Skip the initial context
    return this.currentConversation.slice(1);
  }

  editMessage(idx, newMessage) {
    // idx is the index of the user's message, not the system's
    let i = 0;
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
  }

  _init() {
    this.chatId = "";
    this.currentConversation = [this._initialContext];
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
    if (process.env.NODE_ENV === "test")
      return Promise.resolve({
        choices: [
          {
            message: {
              role: "assistant",
              content: "Test response",
            },
            finish_reason: "stop",
            index: 0,
          },
        ],
      });

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

    this._spinner.start();

    const response = await fetch(this._url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    this._spinner.stop();

    if (!response.ok) {
      // Log the error
      console.error(
        chalk.red(
          `Failed to send completion request. Status code: ${response.status}`
        )
      );

      throw new Error("Failed to send completion request.");
    }

    const json = await response.json();

    this.currentConversation.push({
      ...json.choices[0].message,
      usage: json.usage,
    });

    return json;
  }
}
