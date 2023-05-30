import fs from "fs";
import { getJsonFromFile } from "./util.js";
import {
  COMICS_DOMAIN,
  DROP_MARKDOWN_PATH,
  DROP_WEBTOON_DATA_JSON_FILENAME,
  BEST_LIST_PATH,
} from "./constants.js";
import { removeMarkdownFiles } from "./util.js";

const generateMdFiles = (webtoonData) => {
  const webtoons = Object.values(webtoonData);

  for (let webtoon of webtoons) {
    if (fs.existsSync(`${DROP_MARKDOWN_PATH}/${webtoon.id}.md`)) {
      continue;
    }

    const mdFile = [];

    mdFile.push(
      `# [${webtoon.title}](${COMICS_DOMAIN}/${BEST_LIST_PATH}?titleId=${webtoon.id})`
    );
    mdFile.push(`![thumbnail](${webtoon.thumbnail})`);
    mdFile.push("");
    mdFile.push(`## Author`);
    mdFile.push(`- [${webtoon.author}](${webtoon.authorLink})`);
    mdFile.push("");
    if (webtoon.state) {
      mdFile.push(`## State`);
      mdFile.push(`- ***${webtoon.state}***`);
      mdFile.push("");
    }
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
      mdFile.push(`## Replies (Latest Episode)`);
      for (let reply of webtoon.replies) {
        mdFile.push(`- ${reply}`);
      }
    }
    mdFile.push("");
    if (webtoon.interest) {
      mdFile.push(`## Interest`);
      mdFile.push(`- ${webtoon.interest}`);
      mdFile.push("");
    }
    if (webtoon.firstEpTitle) {
      mdFile.push(`## First Episode`);
      mdFile.push(`- [${webtoon.firstEpTitle}](${webtoon.firstEpLink})`);
      mdFile.push("");
    }
    mdFile.push(`## Latest Episode`);
    for (let image of webtoon.images) {
      mdFile.push(`![image](${image})`);
      mdFile.push("");
    }

    fs.writeFileSync(
      `${DROP_MARKDOWN_PATH}/${webtoon.id}.md`,
      mdFile.join("\n")
    );
  }
};

const main = () => {
  removeMarkdownFiles();
  const webtoonData = getJsonFromFile(DROP_WEBTOON_DATA_JSON_FILENAME);
  generateMdFiles(webtoonData);
};

main();
