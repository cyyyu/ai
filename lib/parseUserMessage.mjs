/**
 * Parse the user message to determine the intent.
 * A message can be:
 * - A command to edit a previous message
 *   - /e<index> <new message>
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
export function parseUserMessage(message) {
  const commandRegex = /^\/e(\d+)?\s(.*)$/;
  const commandMatch = message.match(commandRegex);
  if (commandMatch) {
    const index = commandMatch[1] ? parseInt(commandMatch[1]) : null;
    const message = commandMatch[2];
    return { intent: "edit", index, message };
  } else {
    return { intent: "message", index: null, message };
  }
}
