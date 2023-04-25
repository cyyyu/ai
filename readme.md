# 🤖 AI

A command-line tool for interacting with Azure OpenAI chat completion api.

<img src="https://user-images.githubusercontent.com/15100664/233401551-6640da41-c331-4dac-a624-feb21de23408.gif" alt="Example GIF" width="600" />

## 📥 Installation

`$ npm install -g @cyyyu/ai`

## 🚀 Usage

Create a resource and deploy a model using Azure OpenAI if you haven't done so already. You can follow [this doc](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/create-resource?pivots=web-portal).

Once you have a resource and a model deployed, retrieve the ENDPOINT and API_KEY from Azure portal. Follow [this instruction](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/chatgpt-quickstart?tabs=bash&pivots=rest-api#retrieve-key-and-endpoint).

```bash
export OPENAI_API_KEY=<your api key>
export OPENAI_API_BASE=<your endpoint>
export OPENAI_API_MODEL_NAME=<your model name>
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

-v, --version: Display the version of the tool.

If you use the -i or --interactive option, the tool will start an interactive chat session. You can type messages to the AI assistant and it will respond to you.

## 💡 Examples

Here are some examples of how to use the tool:

### Send a message to the AI assistant

`ai "How to find the biggest folder in a bash shell?"`

![9](https://user-images.githubusercontent.com/15100664/230932415-15eae30a-3554-4115-8034-3d17fd3bf9e0.png)

### Start an interactive chat session

`ai -i` or with a message `ai -i "Why is the ocean blue?"`

![10](https://user-images.githubusercontent.com/15100664/230932408-dfd9c344-501d-4292-a4a9-22b5b2030978.png)

### Use a different prompt

Act as a smart commit message generator:

```bash
alias aicommit="ai -p 'I want you to act as a commit message generator. I will provide you with information about the task and the prefix for the task code, and I would like you to generate an appropriate commit message using the conventional commit format. Do not write any explanations or other words, just reply with the commit message.'"
```

![15](https://user-images.githubusercontent.com/15100664/230936714-982d8aaf-b4ee-4ec2-835d-c2412ad6008c.png)

Act as a fancy title generator:

```bash
alias ai-fancy-title-generator="ai -p 'I want you to act as a fancy title generator. I will type keywords via comma and you will reply with fancy titles.'"
```

![16](https://user-images.githubusercontent.com/15100664/230937129-8ae7f519-8915-42f9-b5c4-1728bd0d1e02.png)

Act as an english translator:

```bash
alias ai-english-translator="ai -p 'I want you to act as an English translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in English. I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level English words and sentences. Keep the meaning same, but make them more literary. I want you to only reply the correction, the improvements and nothing else, do not write explanations.'"
```

![13](https://user-images.githubusercontent.com/15100664/230936735-10a0f26d-6c3b-4b84-a2ab-47454695d0a8.png)

## 📝 License

MIT
