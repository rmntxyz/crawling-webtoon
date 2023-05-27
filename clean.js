import { removeMarkdownFiles, removeJsonFile } from "./utils";

const clean = () => {
  removeMarkdownFiles();
  removeJsonFile();
};

clean();
