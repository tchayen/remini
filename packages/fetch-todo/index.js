const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const lookForFiles = (directory, runOnFile) => {
  fs.readdir(directory, (error, files) => {
    if (error) {
      console.log(error);
      return;
    }

    files.forEach((file) => {
      const path = directory + "/" + file;
      const stat = fs.statSync(path);

      if (stat.isDirectory()) {
        if (file === "node_modules") {
          return;
        }

        lookForFiles(path, runOnFile);
      } else if (stat.isFile() && file.match(/(j|t)sx?$/)) {
        runOnFile(path);
      }
    });
  });
};

const processFile = (file) => {
  fs.readFile(file, { encoding: "utf-8" }, (error, data) => {
    if (error) {
      console.log(error);
      return;
    }

    const lines = data.split("\n");
    const todos = lines
      .map((line, index) => ({ line, index }))
      .filter((line) => line.line.match(/^\s*\/\/ TODO/))
      .map(({ index }) => {
        const comment = [];
        let i = index + 1;
        while (lines[i].match(/^\s*\/\/ /)) {
          comment.push(lines[i].trim().replace("// ", ""));
          i++;
        }

        const absolutePath = path.resolve(file);

        if (comment.length > 0) {
          const header = chalk.bold(
            chalk.green(`${absolutePath}:${index + 1}`)
          );
          console.log(`${header}\n${comment.join("\n")}\n`);
        }

        return {
          start: index,
          end: i,
          comment: comment.join("\n"),
        };
      });
  });
};

lookForFiles("..", processFile);
