import test from "ava";
import process from "node:process";
import { OpenAIChat } from "./lib/OpenAIChat.mjs";

test.beforeEach((t) => {
  process.env.OPENAI_API_BASE = "1";
  process.env.OPENAI_API_KEY = "2";
  process.env.OPENAI_API_MODEL_NAME = "3";
});

test("api key and url are set correctly", (t) => {
  const chat = new OpenAIChat();
  t.is(chat._apiKey, "2");
  t.is(
    chat._url,
    `1/openai/deployments/3/chat/completions?api-version=2023-03-15-preview`
  );
});

test("initial prompt is set correctly", (t) => {
  const chat = new OpenAIChat("hello");
  t.is(chat._initialContext.content, "hello");
});

test("response should match", async (t) => {
  const chat = new OpenAIChat("hello");
  const res = await chat.startNewChat("hi");
  t.is(res, "Test response");
});
