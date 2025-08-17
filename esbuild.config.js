// esbuild.config.js
const esbuild = require("esbuild");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const sass = require("sass");

// --- Build options ---
const buildOptions = {
  entryPoints: ["src/index.ts"], // Your main TS file
  bundle: true, // Don't bundle BGA/Dojo externals
  platform: "browser",
  target: ["es2015"], // ES2015 first; Babel will handle ES5
  outfile: "dist/seaside.js",
  sourcemap: true,
  format: "iife",
  globalName: "seasideModule",
  external: [
    "dojo",
    "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock",
  ],
  banner: {
    js: `define(["dojo", "dojo/_base/declare", "ebg/core/gamegui", "ebg/counter", "ebg/stock"],function (dojo, declare, GameGui) {`
  },
  footer: {
    js: `return declare("bgagame.seaside", GameGui, seasideModule.Seaside); });`,
  },
};

// --- Post-build steps ---

// Transpile ES2015 -> ES5
function transpileToES5() {
  console.log("Running Babel to transpile ES5...");
  execSync(`npx babel dist/seaside.js --out-file dist/seaside.es5.js`, {
    stdio: "inherit",
  });
}

// Compile SCSS
function compileSCSS() {
  console.log("Compiling SCSS...");
  const result = sass.compile(path.join(__dirname, "src/seaside.scss"), {
    style: "compressed",
  });
  fs.writeFileSync("dist/seaside.css", result.css);
}

// Move final files to project root
function moveToRoot() {
  console.log("Moving files to root directory...");
  fs.renameSync("dist/seaside.es5.js", "seaside.js");
  fs.renameSync("dist/seaside.css", "seaside.css");
  //fs.rmdirSync("dist", { recursive: true });
}

// Build/run function
async function runBuild() {
  const isWatch = process.argv.includes("--watch");

  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log("Watching for changes...");
  } else {
    await esbuild.build(buildOptions);
  }

  // Post-build
  transpileToES5();
  compileSCSS();
  moveToRoot();
  console.log("✅ Build complete: ES5 + SCSS + AMD wrapper");
}

// Run the build
runBuild().catch((err) => {
  console.error(err);
  process.exit(1);
});
