import fs from "fs/promises";
import path from "path";

export async function saveToFile(conversation, chatId) {
  const fileName = `conversation-${chatId}.txt`;
  return fs
    .writeFile(
      path.join(process.cwd(), fileName),
      JSON.stringify(conversation, null, 2)
    )
    .then(() => fileName);
}
