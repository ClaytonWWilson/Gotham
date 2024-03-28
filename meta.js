const path = require("path");
const { pathToFileURL } = require("url");
const pkg = require("./package.json");

const packageName = pkg.name;

const production = !process.env.ROLLUP_WATCH;
const devBaseURL = path.join(__dirname, "dist");

let meta = {
  name: production ? packageName : packageName + " -> dev",
  version: pkg.version,
  description: pkg.description,
  homepage: pkg.homepage,
  author: pkg.author,
  namespace: "mailto:eclawils@amazon.com",
  match: ["https://app.chime.aws/*"],
  grant: [
    "GM_addStyle",
    "GM_getResourceText",
    "GM_getValue",
    "GM_setValue",
    "GM_deleteValue",
    "GM_setClipboard",
    "GM_listValues",
    "GM_xmlhttpRequest",
  ],
  connect: ["app.chime.aws"],
  "run-at": "document-idle",
};

if (!production) {
  meta.require = [pathToFileURL(path.join(devBaseURL, "bundle.js"))];
}

if (production) {
  meta.downloadURL =
    "https://github.com/ClaytonWWilson/Gotham/releases/latest/download/gotham.user.js";
  meta.updateURL =
    "https://github.com/ClaytonWWilson/Gotham/releases/latest/download/gotham.user.js";
}

module.exports = meta;
