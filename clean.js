import fs from "fs";
import { MARKDOWN_PATH, WEBTOON_DATA_JSON_FILENAME } from "./constants.js";

fs.readdirSync(MARKDOWN_PATH).forEach((file) => {
  fs.unlinkSync(`${MARKDOWN_PATH}/${file}`);
});

fs.writeFileSync(`${WEBTOON_DATA_JSON_FILENAME}.json`, "{}");
