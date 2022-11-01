import chalk from "chalk";
import { Policy } from "./Policy";
import { maxBy, partition } from "lodash";
// import { Runner } from "./Runner";
import { Config } from "./Config";
import { Result, ResultsMap } from "./match";

const RED_X = chalk.red("❌️");
export const GREEN_CHECK = chalk.green("✅");

export const logCheckFailedError = () => {
  console.error(`\n${RED_X} ${chalk.red.bold("Check failed.")}`);
};


export const logPolicyResult = (result: Result) => {
  if (!result.policy.isCountAcceptable(result.matches)) {
    return console.error(
      `${RED_X} ${chalk.red.bold(result.policy.name)}: ${result.matches.length} (expected ${result.policy.baseline
      } or fewer)`
    );
  }
  return console.log(
    `${GREEN_CHECK} ${chalk.bold(result.policy.name)}: ${result.matches.length}`
  );
};

const logBreachError = (breach: Result) => {
  console.error(
    `${RED_X} ${chalk.red.bold(breach.policy.name)}: ${breach.matches.length} (expected ${breach.policy.baseline
    } or fewer)`
  );

  const count = Math.min(10, breach.matches.length)
  if (breach.matches.length > 10) {
    console.error("First 10 examples:")
  }
  const examples = breach.matches.slice(0, count)

  const longestFilePath = maxBy(examples, example => example.breachPath.length)!.breachPath.length

  const exampleLog = examples
    .map(b => `${chalk.magenta(b.breachPath)}${" ".repeat(longestFilePath - b.breachPath.length)} ${b.startWholeLineFormatted}`)
    .join("\n")

  console.log(exampleLog);

  if (breach.policy.description) {
    console.error(chalk.yellow(breach.policy.description));
  }
};

export const logResults = (resultsMap: ResultsMap, filesChecked: string[]) => {
  const [successes, breaches] = partition(Object.values(resultsMap), ({ policy, matches }) => policy.isCountAcceptable(matches));

  breaches.forEach((b) => {
    logBreachError(b);
  });

  successes.forEach((s) => {
    if (!s.policy.hiddenFromOutput) {
      logPolicyResult(s);
    }
  });

  if (!breaches.length) {
    console.log(`\n${GREEN_CHECK} ${chalk.bold(`All policies passed with ${filesChecked.length} matching files checked`)}`);
  }

  return {
    breaches,
    successes,
  }
};
