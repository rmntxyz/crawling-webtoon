import fs from "fs";
import { getJsonFromFile } from "./util.js";
import {
  MARKDOWN_PATH,
  WEBTOON_DATA_JSON_FILENAME,
  N_COMICS_DOMAIN,
  N_LIST_PATH,
} from "./constants.js";
import { removeMarkdownFiles } from "./util.js";

const generateMdFiles = (webtoonData) => {
  const webtoons = Object.values(webtoonData);

  for (let webtoon of webtoons) {
    if (fs.existsSync(`${MARKDOWN_PATH}/${webtoon.id}.md`)) {
      continue;
    }

    const mdFile = [];

    mdFile.push(
      `# [${webtoon.title}](${N_COMICS_DOMAIN}/${N_LIST_PATH}?titleId=${webtoon.id})`
    );
    mdFile.push(`![thumbnail](${webtoon.thumbnail})`);
    mdFile.push("");
    mdFile.push(`## Author`);
    mdFile.push(`- [${webtoon.author}](${webtoon.authorLink})`);
    mdFile.push("");
    mdFile.push(`## Rating`);
    mdFile.push(`- ${webtoon.rating}`);
    mdFile.push("");
    mdFile.push(`## View Count`);
    mdFile.push(`- ${webtoon.viewCount}`);
    mdFile.push("");
    mdFile.push(`## Genre`);
    mdFile.push(`- ${webtoon.genre}`);
    mdFile.push("");
    mdFile.push(`## Description`);
    mdFile.push(`> ${webtoon.description}`);
    mdFile.push("");
    if (webtoon.replies.length > 0) {
      mdFile.push(`## Replies (Ep.1)`);
      for (let reply of webtoon.replies) {
        mdFile.push(`- ${reply}`);
      }
    }
    mdFile.push("");
    mdFile.push(`## Episode 1`);
    for (let image of webtoon.images) {
      mdFile.push(`![image](${image})`);
      mdFile.push("");
    }

    fs.writeFileSync(`${MARKDOWN_PATH}/${webtoon.id}.md`, mdFile.join("\n"));
  }
};

const main = () => {
  removeMarkdownFiles();
  const webtoonData = getJsonFromFile(WEBTOON_DATA_JSON_FILENAME);
  generateMdFiles(webtoonData);
};

main();
