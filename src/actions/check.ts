import ProgressBar from "progress";
import { Config } from "../Config";
import { CurrentWorkingDirectory } from "../CurrentWorkingDirectory";
import { logCheckFailedError, logResults } from "../log";

export const actionCheck = async function (configFilePath: string | undefined, cwd: CurrentWorkingDirectory) {
  const bar = new ProgressBar('searching for policy violations: [:bar] :percent', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: 20,
  });

  const results = await logResults(configFilePath, cwd, bar);
  const { breaches } = results;

  if (breaches.length) {
    logCheckFailedError();
    process.exitCode = 1;
  }
};
