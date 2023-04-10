export function readFromPipe() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }

    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    let inputString = "";
    process.stdin.on("data", (chunk) => {
      inputString += chunk;
    });
    process.stdin.on("end", () => {
      resolve(inputString.trim());
    });
  });
}
