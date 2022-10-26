import { map } from "bluebird";
import { Policy } from "./Policy";
import { CurrentWorkingDirectory } from "./CurrentWorkingDirectory";
import { Config } from "./Config";
import { readFile } from "fs"
import ProgressBar from "progress";
import { getConfig } from "./configFile";
import micromatch from "micromatch";


interface ThingWithTick {
  tick: () => void;
}

export const getResults = async (
  currentWorkingDirectory: CurrentWorkingDirectory,
  configFilePath: string | undefined,
  bar: ProgressBar
): Promise<Policy[]> => {

  const gettingConfig = getConfig(configFilePath)
  const gettingAllFiles = currentWorkingDirectory.allFiles()
  const gettingGitIgnorePatterns = currentWorkingDirectory.gitIgnorePatterns()

  const conf = await gettingConfig;
  const allFiles = await gettingAllFiles;
  const gitIgnorePatterns = await gettingGitIgnorePatterns;

  const policies = conf.policyMap;
  const policiesList = Object.values(policies);

  // const patternsToMatch = new Set<string>()
  const policyList = Object.values(policies)
  // policyList.forEach(policy => patternsToMatch.add(policy.filePattern))

  // let perc = 0

  // const filesMatchingAnyPattern: string[] = await currentWorkingDirectory.allNonGitIgnoredFilesMatchingPatterns(Array.from(patternsToMatch)) as string[]

  // perc = 0.05
  // bar.update(0.05);

  // const fileInc = (0.95 / filesMatchingAnyPattern.length)

  const filesConfirmedToMatchFile = allFiles
    .filter(file => !micromatch.any(file, gitIgnorePatterns))
    .filter(file => {
      let fileUnderPolicy = false
      for (const policy of policiesList) {
        if (policy.fileUnderPolicy(file)) {
          fileUnderPolicy = true
        }
      }
      // if (!fileUnderPolicy) {
      //   perc += fileInc
      //   bar.update(Math.round(perc * 100) / 100)
      //   // console.log(perc)
      // }
      return fileUnderPolicy;
    });

  await map(filesConfirmedToMatchFile, (filePath: string) => {
    const interestedPolicies = policiesList.filter(policy => policy.filesToCheck.has(filePath))

    return new Promise<void>((resolve, reject) => {
      readFile(filePath, { encoding: "utf8" }, (err, fileContents) => {
        if (err) reject(err);
        interestedPolicies.forEach(policy => {
          policy.processFile(filePath, fileContents);
        })
        // perc += fileInc
        // bar.update(Math.round(perc * 100) / 100)
        // console.log(perc)
        resolve();
      })
    })
  }, { concurrency: 10 });

  return policiesList
};
