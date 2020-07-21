const pshell = require("pshell");

module.exports = async function countPolicy(policy) {
  let commandOutput;
  try {
    commandOutput = await pshell(policy.command, {
      echoCommand: false,
      captureOutput: true
    });
  } catch (ex) {
    console.error("error running shell command ", ex);
    console.error("policy: ", policy);
    throw new Error("some error getting matches for countPolicy");
  }
  if (commandOutput.code !== 0) {
    throw new Error("some error getting matches for countPolicy");
  }
  let count = Number.parseInt(commandOutput.stdout, 10);
  let examples = [];
  if (isNaN(count)) {
    examples = commandOutput.stdout.split("\n").filter(Boolean);
    count = examples.length;
  }
  return {count, examples};
}
