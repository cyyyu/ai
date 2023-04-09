import fetch from "node-fetch";

const OPENAI_API_BASE = process.env.OPENAI_API_BASE;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_MODEL_NAME = process.env.OPENAI_API_MODEL_NAME;
const URL = `${OPENAI_API_BASE}/openai/deployments/${OPENAI_API_MODEL_NAME}/chat/completions?api-version=2023-03-15-preview`;

const DEFAULT_SYSTEM_CONTEXT =
  "Assistant is a large language model trained by OpenAI.";

export class OpenAIChat {
  _initialContext = { role: "system", content: DEFAULT_SYSTEM_CONTEXT };

  constructor() {
    // Make sure OPENAI_API_BASE and OPENAI_API_KEY are set
    if (!OPENAI_API_BASE || !OPENAI_API_KEY) {
      console.log("Please set OPENAI_API_BASE and OPENAI_API_KEY.");
      process.exit(1);
    }
    this.apiKey = OPENAI_API_KEY;
  }

  async startNewChat(userMessage) {
    this._init();
    this.currentConversation.push({ role: "user", content: userMessage });
    const response = await this._sendCompletionRequest();
    this.promptTokens += response.usage.prompt_tokens;
    this.chatId = response.id;
    return response.choices[0].message.content;
  }

  async continueChat(userMessage) {
    this.currentConversation.push({ role: "user", content: userMessage });
    const response = await this._sendCompletionRequest();
    this.promptTokens += response.usage.prompt_tokens;
    return response.choices[0].message.content;
  }

  _init() {
    this.promptTokens = 0;
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
    const headers = {
      "Content-Type": "application/json",
      "api-key": this.apiKey,
    };
    const body = { messages: this.currentConversation };

    const response = await fetch(URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to send completion request.");
    }

    const json = await response.json();

    this.currentConversation.push(json.choices[0].message);

    return json;
  }
}
