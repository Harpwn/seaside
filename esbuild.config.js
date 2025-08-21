// esbuild.config.js
const esbuild = require("esbuild");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const sass = require("sass");
const chokidar = require("chokidar");

const scssFile = path.join(__dirname, "src/seaside.scss");

function compileSCSS() {
  console.log("Compiling SCSS...");
  const result = sass.compile(scssFile, { style: "compressed" });
  fs.writeFileSync("dist/seaside.css", result.css);
  fs.renameSync("dist/seaside.css", "seaside.css");
}

function transpileToES5() {
  console.log("Running Babel to transpile ES5...");
  execSync(`npx babel dist/seaside.js --out-file dist/seaside.es5.js`, {
    stdio: "inherit",
  });
  fs.renameSync("dist/seaside.es5.js", "seaside.js");
}

// --- Plugin to run post-build steps ---
const postBuildPlugin = {
  name: "post-build",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length) return;
      try {
        transpileToES5();
        compileSCSS();
        console.log("✅ Post-build complete");
      } catch (err) {
        console.error("❌ Post-build failed:", err);
      }
    });
  },
};

// --- Esbuild config ---
const buildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "browser",
  target: ["es2015"],
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
    js: `define(["dojo","dojo/_base/declare","ebg/core/gamegui","ebg/counter","ebg/stock"],function(dojo,declare,GameGui){`,
  },
  footer: {
    js: `
    var seasideProto = {};

    // list all classes you want to merge
    [seasideModule.SeasideSetup, seasideModule.SeasideActions, seasideModule.SeasideNotifications]
      .forEach(function(cls) {
        Object.getOwnPropertyNames(cls.prototype).forEach(function(key) {
          if (key !== "constructor") seasideProto[key] = cls.prototype[key];
        });
      });

    return declare("bgagame.seaside", GameGui, seasideProto);
  });`,
  },
  plugins: [postBuildPlugin],
};

// --- Run build ---
async function runBuild() {
  const isWatch = process.argv.includes("--watch");

  if (isWatch) {
    // Watch JS/TS
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log("👀 Watching JS/TS for changes...");

    // Watch SCSS separately
    chokidar.watch(scssFile).on("change", () => {
      console.log("SCSS changed, recompiling...");
      try {
        compileSCSS();
      } catch (err) {
        console.error("❌ Failed to compile SCSS on change:", err.message);
      }
    });
  } else {
    await esbuild.build(buildOptions);
    console.log("✅ Build complete");
  }
}

runBuild().catch((err) => {
  console.error(err);
  process.exit(1);
});
