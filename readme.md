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

If you use the -i or --interactive option, the tool will start an interactive chat session. You can type messages to the AI assistant and it will respond to you.

## Examples

Here are some examples of how to use the tool:

### Send a message to the AI assistant

`ai "Can you provide an example of a puzzle with a six-digit code as the solution?"`

### Start an interactive chat session

`ai -i`

or with a message

`ai -i "Can you provide an example of a puzzle with a six-digit code as the solution?"`

![example1](https://user-images.githubusercontent.com/15100664/230759459-719f9063-ba49-4b24-8049-1588c2419eb6.png)

![example2](https://user-images.githubusercontent.com/15100664/230759456-6932fae1-99de-42ad-b2ad-de565a92ae97.png)

## License

MIT
