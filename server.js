import express from "express";
import matter from "gray-matter";
import markdownIt from "markdown-it";
import { getJsonFromFile } from "./util.js";
import { MARKDOWN_PATH, WEBTOON_DATA_JSON_FILENAME } from "./constants.js";

const app = express();
const port = process.env.PORT || 3737;

app.use(express.static("public"));
app.use("/scripts", express.static("node_modules"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");

const webtoonData = getJsonFromFile(WEBTOON_DATA_JSON_FILENAME);

app.get("/", (req, res) => {
  res.render("index", { webtoonData });
});

app.get("/webtoon", (req, res) => {
  res.render("webtoonList", { webtoonData });
});

app.get("/webtoon/:id", (req, res) => {
  const id = req.params.id;
  const webtoonFile = matter.read(`${MARKDOWN_PATH}/${id}.md`);

  if (!webtoonFile) {
    res.status(404).send("Not Found");
    return;
  }

  const md = markdownIt();
  const converted = md.render(webtoonFile.content);

  res.send(converted);
  // res.render("webtoonDetail", { title: id, converted });
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
