import fs from "fs";

export const getJsonFromFile = (filename) => {
  const data = fs.readFileSync(`${filename}.json`);
  return JSON.parse(data);
};
