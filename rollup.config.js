import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import metablock from "rollup-plugin-userscript-metablock";
import svelte from "rollup-plugin-svelte";
import css from "rollup-plugin-css-only";
import sveltePreprocess from "svelte-preprocess";
import MagicString from "magic-string";
import json from "@rollup/plugin-json";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.ts",
  output: {
    sourcemap: false,
    format: "iife",
    name: "app",
    file: "dist/bundle.js",
  },
  plugins: [
    json(),
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: !production,
      }),
      compilerOptions: {
        dev: !production,
      },
    }),

    css({
      output: "bundle.css",
    }),

    // rollup-plugin-tampermonkey-css
    ((options = {}) => ({
      name: "rollup-plugin-tampermonkey-css",
      renderChunk: (code, renderedChunk, outputOptions) => {
        let magicString = new MagicString(code);
        const fs = require("fs");
        const path = require("path");
        let css = fs.readFileSync(
          path.join(__dirname, "dist", "bundle.css"),
          "utf8",
          (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(data);
          }
        );
        css = css.replace(/\r/g, "").replace(/\n/g, "");
        magicString.prepend(`GM_addStyle("${css}");\n`);

        const result = { code: magicString.toString() };
        if (outputOptions.sourceMap) {
          result.map = magicString.generateMap({ hires: true });
        }
        return result;
      },
    }))(),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),

    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),

    metablock({ file: "./meta.js" }),
  ],
  watch: {
    clearScreen: false,
  },
};
