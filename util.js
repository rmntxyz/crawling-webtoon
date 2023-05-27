import fs from "fs";
import { MARKDOWN_PATH, WEBTOON_DATA_JSON_FILENAME } from "./constants.js";

export const getJsonFromFile = (filename) => {
  const data = fs.readFileSync(`${filename}.json`);
  return JSON.parse(data);
};

export const removeMarkdownFiles = () => {
  fs.readdirSync(MARKDOWN_PATH).forEach((file) => {
    fs.unlinkSync(`${MARKDOWN_PATH}/${file}`);
  });
};

export const removeJsonFile = () => {
  fs.writeFileSync(`${WEBTOON_DATA_JSON_FILENAME}.json`, "{}");
};
