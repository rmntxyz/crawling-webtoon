import express from "express";
import matter from "gray-matter";
import markdownIt from "markdown-it";
import { getJsonFromFile } from "./util.js";
import {
  CHAL_MARKDOWN_PATH,
  CHAL_WEBTOON_DATA_JSON_FILENAME,
  BEST_MARKDOWN_PATH,
  BEST_WEBTOON_DATA_JSON_FILENAME,
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

const md = markdownIt();

app.get("/", (req, res) => {
  res.render("index", { webtoons: chalWebtoons });
});

app.get("/best", (req, res) => {
  res.render("index", { webtoons: bestWebtoons });
});

app.get("/webtoon", (req, res) => {
  res.render("webtoonList", { webtoons: chalWebtoons, best: bestWebtoons });
});

app.get("/webtoon/:id", (req, res) => {
  const id = req.params.id;
  const { best } = req.query;
  let mdPath = best === "true" ? BEST_MARKDOWN_PATH : CHAL_MARKDOWN_PATH;

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
