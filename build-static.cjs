const { execSync } = require("child_process");
const { cpSync, existsSync } = require("fs");
const { join } = require("path");

try {
  execSync(".\\node_modules\\.bin\\ng.cmd build", { stdio: "inherit", shell: true });
} catch (e) {
  process.exit(1);
}

const browserOut = "dist/app/browser";
const distRoot = "dist";

if (existsSync("public")) {
  try {
    cpSync("public", browserOut, { recursive: true, force: true });
  } catch (e) {
    console.error("Error copying public:", e.message);
  }
}

if (existsSync("index.html")) {
  try {
    cpSync("index.html", join(browserOut, "index.html"), { force: true });
  } catch (e) {
    console.error("Error copying index.html:", e.message);
  }
}

try {
  if (existsSync(browserOut)) {
    cpSync(browserOut, distRoot, { recursive: true, force: true });
  }
} catch (e) {
  console.error("Error copying to dist root:", e.message);
}

console.log("Build completed successfully");
