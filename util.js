import fs from "fs";
import { MARKDOWN_PATH, WEBTOON_DATA_JSON_FILENAME } from "./constants.js";

export const getJsonFromFile = (filename) => {
  const data = fs.readFileSync(`${filename}.json`);
  return JSON.parse(data);
};

export const removeMarkdownFiles = (path) => {
  fs.readdirSync(path).forEach((file) => {
    fs.unlinkSync(`${path}/${file}`);
  });
};

export const removeJsonFile = () => {
  fs.writeFileSync(`${WEBTOON_DATA_JSON_FILENAME}.json`, "{}");
};
