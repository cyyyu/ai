# 🤖 AI

A command-line tool for interacting with Azure OpenAI chat completion api.

<img width="842" alt="Example" src="https://github.com/cyyyu/ai/assets/15100664/fa9c6d6c-7e11-4e8d-8ecb-d38841a738ee">

## 📥 Installation

`$ npm install -g @cyyyu/ai`

## 🚀 Usage

Create a resource and deploy a model using Azure OpenAI if you haven't done so already. You can follow [this doc](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/create-resource?pivots=web-portal).

Once you have a resource and a model deployed, retrieve the ENDPOINT and API_KEY from Azure portal. Follow [this instruction](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/chatgpt-quickstart?tabs=bash&pivots=rest-api#retrieve-key-and-endpoint).

```bash
export OPENAI_API_KEY=<your api key>
export OPENAI_API_BASE=<your endpoint>
export OPENAI_API_MODEL_NAME=<your model name>
export AZURE_API_VERSION=<api version> // optional defaults to 2024-02-01
```

Then you can use the tool to interact with the AI assistant.

```bash
$ ai [options] [message]
```

Options:

-h, --help: Display a help message that explains how to use the tool.

-m, --message: Send a message to the AI assistant.

-i, --interactive: Start an interactive chat session with the AI assistant.

-p, --prompt: The prompt to use for the AI assistant. Default is "Assistant is a large language model trained by OpenAI.".

-u, --usage: Show usage statistics.

-v, --version: Display the version of the tool.

If you use the -i or --interactive option, the tool will start an interactive chat session. You can type messages to the AI assistant and it will respond to you.

## 💡 Examples

Here are some examples of how to use the tool:

### Send a message to the AI assistant

`ai "How to find the biggest folder in a bash shell?"`

<img width="842" alt="ai 'How to find the biggest folder in a bash shell?'" src="https://github.com/cyyyu/ai/assets/15100664/8aba0397-1e02-4290-a745-f11b1bfa0f67">

### Start an interactive chat session

`ai -i` or with a message `ai -i "Why is the ocean blue?"`

<img width="842" alt="ai -i 'Why is the ocean blue?'" src="https://github.com/cyyyu/ai/assets/15100664/8f986b73-6e8a-4577-80ff-a6dd8698ae32">

### Use a different prompt

1. Act as a smart commit message generator:

```bash
alias aicommit="ai -p 'I want you to act as a commit message generator. I will provide you with information about the task and the prefix for the task code, and I would like you to generate an appropriate commit message using the conventional commit format. Do not write any explanations or other words, just reply with the commit message.'"
```

You can pipe to it.

![demo3](https://user-images.githubusercontent.com/15100664/234441674-d2c305e8-1c00-40d6-9de4-e6be4dcefc5e.png)

2. Act as a fancy title generator:

```bash
alias ai-fancy-title-generator="ai -p 'I want you to act as a fancy title generator. I will type keywords via comma and you will reply with fancy titles.'"
```

![demo4](https://user-images.githubusercontent.com/15100664/234442008-d30d8e6c-eaaa-4115-a71c-9b07886da393.png)

3. Act as an english translator:

```bash
alias ai-english-translator="ai -p 'I want you to act as an English translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in English. I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level English words and sentences. Keep the meaning same, but make them more literary. I want you to only reply the correction, the improvements and nothing else, do not write explanations.'"
```

![demo5](https://user-images.githubusercontent.com/15100664/234441399-6ee81496-7e77-4745-9d60-7b81e5199977.png)

### Explorer more wonderful prompts

* [https://github.com/f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
* [https://github.com/PlexPt/awesome-chatgpt-prompts-zh](https://github.com/PlexPt/awesome-chatgpt-prompts-zh)(中文)

## 📝 License

MIT
