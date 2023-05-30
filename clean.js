import { MARKDOWN_PATH } from "./constants.js";
import { removeMarkdownFiles, removeJsonFile } from "./util.js";

//if env ONLY_MD = true then remove json file

const clean = () => {
  removeMarkdownFiles(MARKDOWN_PATH);

  if (process.env.ONLY_MD === "true") {
    return;
  }

  removeJsonFile();
};

clean();
