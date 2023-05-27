import fs from "fs";
import { filesize } from "filesize";
import { getJsonFromFile } from "./util.js";
import { WEBTOON_DATA_JSON_FILENAME } from "./constants.js";

const saveWebtoonData = (webtoonData) => {
  const data = JSON.stringify(webtoonData);
  fs.writeFileSync(`${WEBTOON_DATA_JSON_FILENAME}.json`, data);

  var stats = fs.statSync(`${WEBTOON_DATA_JSON_FILENAME}.json`);
  console.info(filesize(stats.size, { round: 0 }));
};

const main = () => {
  const webtoonData = getJsonFromFile(WEBTOON_DATA_JSON_FILENAME);

  for (let key in webtoonData) {
    const countText = webtoonData[key].viewCount;
    let count = countText;

    if (countText.includes(",")) {
      count = count.replace(",", "");
    }

    if (countText.includes("만")) {
      count = count.replace("만", "") * 10000;
    }

    webtoonData[key].viewCount = count;
  }
  saveWebtoonData(webtoonData);
};

main();
