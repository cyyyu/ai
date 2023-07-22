/**
 * Parse the user message to determine the intent.
 * A message can be:
 * - A command to edit a previous message
 *   - /e<index> <new message>
 *   A command to copy a previous message
 *   - /c<index>
 *   A command to save the whole conversation to a file
 *   - /s <file>
 *   A command to load the whole conversation from a file. This will overwrite the current conversation
 *   - /l <file>
 * - A message
 *   - <message>
 * Example:
 * - /e1 Hello, world!
 *   - intent: edit
 *   - index: 1
 *   - message: Hello, world!
 *   - return: { intent: "edit", index: 1, message: "Hello, world!" }
 * - Hello, world!
 *   - intent: message
 *   - index: null
 *   - message: Hello, world!
 * @param {string} message
 * @returns {object} { intent: string, index: number, message: string }
 */
export function parseUserMessage(message = "") {
  const commandRegex = /^\/([ecsl])(\d+)?(.*)$/;
  const commandMatch = message.match(commandRegex);
  if (commandMatch) {
    const index = commandMatch[2] ? parseInt(commandMatch[2]) : null;
    const message = commandMatch[3] ? commandMatch[3].trim() : "";
    if (commandMatch[1] === "e") {
      return { intent: "edit", index, message };
    } else if (commandMatch[1] === "c") {
      return { intent: "copy", index, message };
    } else if (commandMatch[1] === "s") {
      return { intent: "save", index, message };
    } else if (commandMatch[1] === "l") {
      return { intent: "load", index, message };
    }
  } else {
    return { intent: "message", index: null, message };
  }
}
