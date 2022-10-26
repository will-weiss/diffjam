import { fdir } from "fdir";
import ignore from 'parse-gitignore';
import mm from 'micromatch';
import { readFile } from "fs";
import { join } from "path";

export const cleanIgnorePatterns = (ignorePatterns: string[]): string[] => {
  const retval = ignorePatterns.map((p) => {
    if (p[0] && p[0] === "/") {
      return p.slice(1, p.length);
    }
    const lastChar = p[p.length - 1];
    if (lastChar && lastChar === "/") {
      return p.slice(0, p.length - 1);
    }
    return p;
  })
  return retval;
}

export class CurrentWorkingDirectory {
  constructor(public cwd: string) { }

  gitIgnorePatterns(): Promise<string[]> {
    const gitignorePath = join(this.cwd, ".gitignore");
    return new Promise(resolve => {
      readFile(gitignorePath, { encoding: "utf8" }, (err, fileContents) => {
        if (err) resolve([]);
        resolve(cleanIgnorePatterns(ignore(fileContents)));
      });
    });
  }

  allFiles(): Promise<string[]> {
    return new fdir()
      .withRelativePaths()
      .withErrors()
      .filter((_, isDirectory) => !isDirectory)
      .crawl(this.cwd)
      .withPromise() as any
  }
}
