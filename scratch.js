const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const env = fs.readFileSync(".env.local", "utf-8");
const match = env.match(/GEMINI_API_KEY=(.*)/);
const key = match ? match[1].trim() : null;

if (!key) {
  console.log("No key");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(key);

async function run() {
  // It seems listModels() is not available on the instance directly in older SDKs, but we can try fetching from the REST API directly.
  const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key);
  const data = await resp.json();
  console.log(data.models.map(m => m.name).join(", "));
}
run();
