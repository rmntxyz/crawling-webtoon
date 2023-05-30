export const COMICS_DOMAIN = "https://comic.naver.com";

export const BEST_DETAIL_PATH = "bestChallenge/detail";
export const BEST_LIST_PATH = "bestChallenge/list";
export const BEST_MARKDOWN_PATH = "public/markdown-best";
export const BEST_WEBTOON_DATA_JSON_FILENAME = "bestWebtoonData";
export const BEST_START_PAGE = 1;
export const BEST_END_PAGE = 100;

export const CHAL_DETAIL_PATH = "challenge/detail";
export const CHAL_LIST_PATH = "challenge/list";
export const CHAL_MARKDOWN_PATH = "public/markdown";
export const CHAL_WEBTOON_DATA_JSON_FILENAME = "webtoonData";
export const CHAL_START_PAGE = 1;
export const CHAL_END_PAGE = 51;

export const DROP_MARKDOWN_PATH = "public/markdown-drop";
export const DROP_WEBTOON_DATA_JSON_FILENAME = "dropWebtoonData";
export const DROP_START_PAGE = 1;
export const DROP_END_PAGE = 30;

const type = process.env.BUILD_TYPE;

export const DETAIL_PATH =
  type === "best" ? BEST_DETAIL_PATH : CHAL_DETAIL_PATH;
export const LIST_PATH = type === "best" ? BEST_LIST_PATH : CHAL_LIST_PATH;
export const MARKDOWN_PATH =
  type === "best" ? BEST_MARKDOWN_PATH : CHAL_MARKDOWN_PATH;
export const WEBTOON_DATA_JSON_FILENAME =
  type === "best"
    ? BEST_WEBTOON_DATA_JSON_FILENAME
    : CHAL_WEBTOON_DATA_JSON_FILENAME;
export const START_PAGE = type === "best" ? BEST_START_PAGE : CHAL_START_PAGE;
export const END_PAGE = type === "best" ? BEST_END_PAGE : CHAL_END_PAGE;
