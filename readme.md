# AI

A command-line tool for interacting with Azure OpenAI chat completion api.

## Installation

`$ npm install -g @cyyyu/ai`

## Usage

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

If you use the -i or --interactive option, the tool will start an interactive chat session. You can type messages to the AI assistant and it will respond to you.

## Examples

Here are some examples of how to use the tool:

### Send a message to the AI assistant

`ai "Can you provide an example of a puzzle with a six-digit code as the solution?"`

### Start an interactive chat session

`ai -i`

or with a message

`ai -i "Can you provide an example of a puzzle with a six-digit code as the solution?"`

### Screenshots

![6](https://user-images.githubusercontent.com/15100664/230783200-00cbb043-99f2-4a51-ab97-0d954cf097b2.png)

![7](https://user-images.githubusercontent.com/15100664/230783331-3537cacd-0e77-475c-b22f-386543c433fb.png)

![2](https://user-images.githubusercontent.com/15100664/230782730-d4ce8746-f335-4199-81b2-74d37271fa4a.png)

![1](https://user-images.githubusercontent.com/15100664/230782732-3939f69b-d0ec-43fe-9ddf-7377c51b2944.png)

## License

MIT
