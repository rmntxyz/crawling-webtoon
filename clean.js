import { removeMarkdownFiles, removeJsonFile } from "./util.js";

//if env ONLY_MD = true then remove json file

const clean = () => {
  removeMarkdownFiles();

  if (process.env.ONLY_MD === "true") {
    return;
  }

  removeJsonFile();
};

clean();
