import puppeteer from "puppeteer";
import fs from "fs";
import { getJsonFromFile } from "./util.js";
import {
  COMICS_DOMAIN,
  CHAL_WEBTOON_DATA_JSON_FILENAME,
  DROP_WEBTOON_DATA_JSON_FILENAME,
  DROP_START_PAGE,
  DROP_END_PAGE,
} from "./constants.js";
import { filesize } from "filesize";

const goto = async (page, url, options = {}) => {
  const { waitUntil = "networkidle2" } = options;
  await page.goto(url, { waitUntil });
};

const getWebtoonData = async (page, data) => {
  const webtoonList = await page.evaluate(() => {
    // ul selector is #content > div:nth-child(2) > ul
    const webtoons = document.querySelectorAll(
      "#content > div:nth-child(2) > ul > li"
    );
    const list = [];

    for (let webtoon of webtoons) {
      const badge = webtoon.querySelector("a > div > div > i > span");
      const state = badge !== null ? badge.innerText : null;

      if (state === "지상최대") {
        const id = webtoon.querySelector("a").href.split("=")[1];
        list.push(id);
      }
    }

    return list;
  });

  for (let id of webtoonList) {
    if (data[id]) {
      delete data[id];
    }
  }
  console.log(
    `find: ${webtoonList.length}, rest: ${Object.values(data).length}`
  );
};

const saveWebtoonData = (webtoonData) => {
  const data = JSON.stringify(webtoonData);
  fs.writeFileSync(`${DROP_WEBTOON_DATA_JSON_FILENAME}.json`, data);

  var stats = fs.statSync(`${DROP_WEBTOON_DATA_JSON_FILENAME}.json`);
  console.info(filesize(stats.size, { round: 0 }));
};

const main = async () => {
  //headless: false, slowMo: 100
  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();
  const webtoonData = getJsonFromFile(CHAL_WEBTOON_DATA_JSON_FILENAME);

  try {
    for (let i = DROP_START_PAGE; i <= DROP_END_PAGE; i++) {
      console.log(`start to scrape page ${i}`);

      await goto(
        page,
        `${COMICS_DOMAIN}/bestChallenge?sortType=update&page=${i}`
      );

      await getWebtoonData(page, webtoonData);
      saveWebtoonData(webtoonData);
    }

    await browser.close();
  } catch (e) {
    console.log(e);
    await browser.close();
    saveWebtoonData(webtoonData);
  }
};

main();
