import test from "ava";
import process from "node:process";
import { OpenAIChat } from "./lib/OpenAIChat.mjs";

test.beforeEach((t) => {
  process.env.OPENAI_ENDPOINT = "https://example.openai.azure.com/openai/v1/";
  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_DEPLOYMENT = "gpt-4";
});

test("client and model are set correctly", (t) => {
  const chat = new OpenAIChat();
  t.truthy(chat._client);
  t.is(chat._model, "gpt-4");
});

test("initial prompt is set correctly", (t) => {
  const chat = new OpenAIChat("hello");
  t.is(chat._initialContext.content, "hello");
});

test("response should match", async (t) => {
  const chat = new OpenAIChat("hello");
  chat.chat("hi");
  const res = await chat.sendMessage();
  t.is(res.role, "assistant");
  t.is(res.content, "Test response");
});
