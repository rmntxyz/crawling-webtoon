import puppeteer from "puppeteer";
import fs from "fs";
import { getJsonFromFile } from "./util.js";
import {
  COMICS_DOMAIN,
  LIST_PATH,
  DETAIL_PATH,
  WEBTOON_DATA_JSON_FILENAME,
  START_PAGE,
  END_PAGE,
} from "./constants.js";
import { filesize } from "filesize";

let counter = 1;

// https://www.urlbox.io/puppeteer-wait-for-page-load
const goto = async (page, url, options = {}) => {
  // const { waitUntil = "domcontentloaded", idleTime = 250 } = options;
  const { waitUntil = "networkidle2", idleTime = 250 } = options;

  await Promise.all([
    page.goto(url, { waitUntil }),
    page.waitForNetworkIdle({ idleTime }),
  ]);
};

const getFirstWebtoon = async (page) => {
  const result = await page.evaluate(async () => {
    const images = [];
    const replies = [];

    const imageList = document.querySelectorAll("#comic_view_area img");
    for (let image of imageList) {
      images.push(image.src);
    }

    const replyList = document.querySelectorAll(
      "#cbox_module_wai_u_cbox_content_wrap_tabpanel .u_cbox_contents"
    );
    for (let reply of replyList) {
      replies.push(reply.innerText);
    }

    // const rating =
    //   document.querySelector(
    //     "#viewerView > div > div > div > div > button:nth-child(3) > span > span"
    //   ).innerText || 0;

    return { images, replies /* rating, step */ };
  });

  return result;
};

const getWebtoonInfo = async (page) => {
  const webtoonInfo = await page.evaluate(() => {
    const info = document.querySelector("#content > div");
    const thumbnail = info.querySelector("button")
      ? info.querySelector("button > div > img").src
      : info.querySelector("div > img").src;
    const title = info.querySelector("div > h2").innerText;
    const author = info.querySelector("div > div > span > a").innerText;
    const authorLink = info.querySelector("div > div > span > a").href;
    const genre = info
      .querySelector("div > div > span:nth-child(2)")
      .innerText.split("\n")
      .pop();
    const description = info.querySelector(
      "div > div > div:nth-child(3) > p"
    ).innerText;

    return {
      thumbnail,
      title,
      author,
      authorLink,
      genre,
      description,
    };
  });

  return webtoonInfo;
};

const getWebtoonData = async (page, data) => {
  const browser = page.browser();

  const webtoonList = await page.evaluate(() => {
    // ul selector is #content > div:nth-child(2) > ul
    const webtoons = document.querySelectorAll(
      "#content > div:nth-child(2) > ul > li"
    );
    const list = [];

    for (let webtoon of webtoons) {
      // 지상최대공모전 filter
      if (webtoon.querySelector("a > div > div > i > svg") !== null) {
        const id = webtoon.querySelector("a").href.split("=")[1];

        let viewCount = webtoon.querySelector(
          "div > div > span:nth-child(2) > span"
        ).innerText;

        if (viewCount.includes(",")) {
          viewCount = viewCount.replace(",", "");
        }

        if (viewCount.includes("만")) {
          viewCount = viewCount.replace("만", "") * 10000;
        }

        const rating = webtoon.querySelector(
          "div > div > span > span"
        ).innerText;
        const step = [100, 99, 98, 96, 94, 92, 90, 70, 40, 0].find(
          (n) => n <= Number(rating) * 10
        );

        list.push({ id, rating, viewCount, step });
      }
    }

    return list;
  });

  const eachPage = await browser.newPage();

  for (let listInfo of webtoonList) {
    const { id } = listInfo;

    if (data[id]) {
      data[id].index = counter++;
      continue;
    }

    console.log(`start to scrap webtoon ${id}`);

    try {
      await goto(eachPage, `${COMICS_DOMAIN}/${LIST_PATH}?titleId=${id}`);
      const webtoonInfo = await getWebtoonInfo(eachPage);

      await goto(eachPage, `${COMICS_DOMAIN}/${DETAIL_PATH}?titleId=${id}`);
      const firstWebtoon = await getFirstWebtoon(eachPage);

      data[id] = {
        index: counter++,
        ...listInfo,
        ...webtoonInfo,
        ...firstWebtoon,
      };
    } catch (e) {
      console.error(`Error is accured while scrapping ${id}`, e);
      throw e;
    }
  }
  eachPage.close();
};

const saveWebtoonData = (webtoonData) => {
  const data = JSON.stringify(webtoonData);
  fs.writeFileSync(`${WEBTOON_DATA_JSON_FILENAME}.json`, data);

  var stats = fs.statSync(`${WEBTOON_DATA_JSON_FILENAME}.json`);
  console.info(filesize(stats.size, { round: 0 }));
};

const main = async () => {
  //headless: false, slowMo: 100
  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();
  const webtoonData = getJsonFromFile(WEBTOON_DATA_JSON_FILENAME);

  try {
    for (let i = START_PAGE; i <= END_PAGE; i++) {
      console.log(`start to scrape page ${i}`);

      await goto(
        page,
        `${COMICS_DOMAIN}/challenge?tab=total&sortType=update&page=${i}`
      );

      await getWebtoonData(page, webtoonData);
      saveWebtoonData(webtoonData);
    }

    await browser.close();
  } catch (e) {
    await browser.close();
    saveWebtoonData(webtoonData);
  }
};

main();
