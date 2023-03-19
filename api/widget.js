import { readFile } from "fs/promises";
import { resolve, join } from "path";

const staticDir = "./dist";

export default async function handler(request, response) {
  const manifestPath = resolve(join(staticDir, "d", "manifest.json"));
  const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));

  const { file: widgetEntry } = manifest["widget.js"];

  response.setHeader("Content-Type", "application/javascript");
  response.setHeader("Cache-Control", "max-age=0, s-maxage=604800");

  response.status(200).send(`
// 🍀 re-export from the actual build chunk
export * from "/d/${widgetEntry}";`);
}
