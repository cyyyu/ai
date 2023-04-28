// This file is used to cache whatever is written to the terminal.
// When user intents to edit a message, the cached message is used to calculate how many lines need to be cleared.
let cache = "";

// Cache whatever is written to the process.stdout
process.stdout.write = (function(write) {
  return function(string, encoding, fd) {
    cache += string;
    write.apply(process.stdout, arguments);
  };
})(process.stdout.write);

// Cache whatever is written to the process.stderr
process.stderr.write = (function(write) {
  return function(string, encoding, fd) {
    cache += string;
    write.apply(process.stderr, arguments);
  };
})(process.stderr.write);

// Return the number of lines below the message
// The calculation is based on the cached message and size of the terminal.
export function getLinesBelowMessage(messageIdx) {
  const cols = process.stdout.columns;
  // Split the cache into lines.
  // Respect the line breaks (\n) and the terminal width.
  const spliter = new RegExp(`\n`, "g");
  const lines = cache.split(spliter);
  // Search for the target line
  // The target line contains "You: [messageIdx]"
  let targetLineIdx = -1;
  let targetMessage = new RegExp(`You: .*\\[${messageIdx}\\]`);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (targetMessage.test(line)) {
      targetLineIdx = i;
      console.log(`ppppp lines: ${lines}`);
      console.log(`ppppp line: ${line}`);
      console.log(`ppppp targetLineIdx: ${targetLineIdx}`);
      break;
    }
  }

  // Return the number of lines below the target line
  return lines.length - targetLineIdx;
}

export function getCache() {
  return cache;
}
