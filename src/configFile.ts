import { exists as fileExists, readFile, writeFile } from "mz/fs";
import { join } from "path";
import { Config } from "./Config";
import { Policy } from "./Policy";


const defaultFilePath = join(process.cwd(), "diffjam.yaml");

export function exampleConfig(): Config {
  return new Config({
    "Example policy": new Policy(
      "Example policy",
      "An example policy ensuring there are no TODOs in the code",
      "src/**/*.*",
      ["regex:TODO"],
      0
    )
  });
}

export async function getConfig(file = defaultFilePath): Promise<Config> {
  return new Promise((resolve, reject) => {
    readFile(file, { encoding: "utf8" }, (err, fileContents) => {
      if (err) return resolve(new Config({}))
      try {
        resolve(Config.fromYaml(fileContents))
      } catch (e) {
        reject(e)
      }
    });
  });
}

// export const writeConfig = (conf: Config, filePath = defaultFilePath) => {
//   writeFile(filePath, conf.toYaml());
// };

// export function savePolicy(name: string, policy: Policy) {
//   config.setPolicy(name, policy);
//   writeConfig(config);
// }

// export function deletePolicy(name: string) {
//   config.deletePolicy(name);
//   writeConfig(config);
// }

// export function setPolicyBaseline(name: string, count: number) {
//   const policy = config.getPolicy(name);
//   policy.baseline = count;
//   writeConfig(config);
// }

// export function clear() {
//   config = new Config({});
// }
