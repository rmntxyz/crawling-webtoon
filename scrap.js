import puppeteer from "puppeteer";
import fs from "fs";
import { getJsonFromFile } from "./util.js";
import {
  N_COMICS_DOMAIN,
  N_LIST_PATH,
  N_DETAIL_PATH,
  WEBTOON_DATA_JSON_FILENAME,
  MARKDOWN_PATH,
  START_PAGE,
  END_PAGE,
} from "./constants.js";
import { filesize } from "filesize";

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

    const rating =
      document.querySelector(
        "#viewerView > div > div > div > div > button:nth-child(3) > span > span"
      ).innerText || 0;

    const step = [100, 99, 98, 96, 94, 92, 90, 70, 40, 0].find(
      (n) => n <= Number(rating) * 10
    );

    return { images, replies, rating, step };
  });

  return result;
};

const getWebtoonInfo = async (page) => {
  const webtoonInfo = await page.evaluate(() => {
    const listInfo = document.querySelector("#content > div");
    const thumbnail = listInfo.querySelector("button > div > img").src;
    const title = listInfo.querySelector("div > h2").innerText;
    const author = listInfo.querySelector("div > div > span > a").innerText;
    const authorLink = listInfo.querySelector("div > div > span > a").href;
    const genre = listInfo
      .querySelector("div > div > span:nth-child(2)")
      .innerText.split("\n")
      .pop();
    const description = listInfo.querySelector(
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

  const webtoonIds = await page.evaluate(() => {
    // ul selector is #content > div:nth-child(2) > ul
    const webtoonList = document.querySelectorAll(
      "#content > div:nth-child(2) > ul > li"
    );
    const ids = [];

    for (let webtoon of webtoonList) {
      const titleId = webtoon.querySelector("a").href.split("=")[1];

      // 지상최대공모전 filter
      if (webtoon.querySelector("a > div > div > i > svg") !== null) {
        ids.push(titleId);
      }
    }

    return ids;
  });

  const eachPage = await browser.newPage();

  for (let id of webtoonIds) {
    if (data[id] || ["810804", "810170", "810173"].includes(id)) {
      continue;
    }

    console.log(`start to scrap webtoon ${id}`);

    await goto(eachPage, `${N_COMICS_DOMAIN}/${N_LIST_PATH}?titleId=${id}`);
    const webtoonInfo = await getWebtoonInfo(eachPage);

    await goto(eachPage, `${N_COMICS_DOMAIN}/${N_DETAIL_PATH}?titleId=${id}`);
    const firstWebtoon = await getFirstWebtoon(eachPage);

    data[id] = {
      id,
      ...webtoonInfo,
      ...firstWebtoon,
    };
  }

  eachPage.close();
};

const saveWebtoonData = (webtoonData) => {
  const data = JSON.stringify(webtoonData);
  fs.writeFileSync(`${WEBTOON_DATA_JSON_FILENAME}.json`, data);

  var stats = fs.statSync(`${WEBTOON_DATA_JSON_FILENAME}.json`);
  console.info(filesize(stats.size, { round: 0 }));
};

const createMdFiles = (webtoonData) => {
  const webtoons = Object.values(webtoonData);

  for (let webtoon of webtoons) {
    if (fs.existsSync(`${MARKDOWN_PATH}/${webtoon.id}.md`)) {
      continue;
    }

    const mdFile = [];

    mdFile.push(`# ${webtoon.title}`);
    mdFile.push(`![thumbnail](${webtoon.thumbnail})`);
    mdFile.push("");
    mdFile.push(`## Author`);
    mdFile.push(`- [${webtoon.author}](${webtoon.authorLink})`);
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
    mdFile.push(`## Rating (Ep.1)`);
    mdFile.push(`- ${webtoon.rating}`);
    mdFile.push("");
    mdFile.push(`## Episode 1`);
    for (let image of webtoon.images) {
      mdFile.push(`![image](${image})`);
      mdFile.push("");
    }

    fs.writeFileSync(`${MARKDOWN_PATH}/${webtoon.id}.md`, mdFile.join("\n"));
  }
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
        `${N_COMICS_DOMAIN}/challenge?tab=total&sortType=update&page=${i}`
      );

      await getWebtoonData(page, webtoonData);

      saveWebtoonData(webtoonData);
    }

    await browser.close();
    createMdFiles(webtoonData);
  } catch (e) {
    console.error(e);
    await browser.close();
    saveWebtoonData(webtoonData);
  }
};

main();
