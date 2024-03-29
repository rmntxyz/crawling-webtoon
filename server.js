import express from "express";
import matter from "gray-matter";
import markdownIt from "markdown-it";
import { getJsonFromFile } from "./util.js";
import {
  CHAL_MARKDOWN_PATH,
  CHAL_WEBTOON_DATA_JSON_FILENAME,
  BEST_MARKDOWN_PATH,
  BEST_WEBTOON_DATA_JSON_FILENAME,
  DROP_MARKDOWN_PATH,
  DROP_WEBTOON_DATA_JSON_FILENAME,
} from "./constants.js";

const app = express();
const port = process.env.PORT || 3737;

app.use(express.static("public"));
app.use("/scripts", express.static("node_modules"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");

const chalWebtoonData = getJsonFromFile(CHAL_WEBTOON_DATA_JSON_FILENAME);
const chalWebtoons = Object.values(chalWebtoonData);
chalWebtoons.sort((a, b) => {
  return a.index - b.index;
});

const bestWebtoonData = getJsonFromFile(BEST_WEBTOON_DATA_JSON_FILENAME);
const bestWebtoons = Object.values(bestWebtoonData);
bestWebtoons.sort((a, b) => {
  return a.index - b.index;
});

const dropWebtoonData = getJsonFromFile(DROP_WEBTOON_DATA_JSON_FILENAME);
const dropWebtoons = Object.values(dropWebtoonData);
dropWebtoons.sort((a, b) => {
  return a.index - b.index;
});

const md = markdownIt();

const chall = { name: "지상 최대 공모전", location: "/" };
const best = { name: "베스트도전 ", location: "/best" };
const drop = { name: "공모전 드랍", location: "/drop" };

app.get("/", (req, res) => {
  res.render("index", {
    webtoons: chalWebtoons,
    categories: [chall, best, drop],
    date: "23.05.27",
  });
});

app.get("/best", (req, res) => {
  res.render("index", {
    webtoons: bestWebtoons,
    categories: [best, chall, drop],
    date: "23.05.28",
    hasState: true,
  });
});

app.get("/drop", (req, res) => {
  res.render("index", {
    webtoons: dropWebtoons,
    categories: [drop, best, chall],
    date: "23.05.30",
  });
});

app.get("/webtoon", (req, res) => {
  res.render("webtoonList", { webtoons: chalWebtoons, best: bestWebtoons });
});

app.get("/webtoon/:id", (req, res) => {
  const id = req.params.id;
  const { best, drop } = req.query;
  let mdPath =
    best === "true"
      ? BEST_MARKDOWN_PATH
      : drop === "true"
      ? DROP_MARKDOWN_PATH
      : CHAL_MARKDOWN_PATH;

  const webtoonFile = matter.read(`${mdPath}/${id}.md`);

  if (!webtoonFile) {
    res.status(404).send("Not Found");
    return;
  }

  const converted = md.render(webtoonFile.content);

  res.send(converted);
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
