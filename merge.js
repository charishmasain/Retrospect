const fs = require('fs');

const files = [
  'src/lib/hindsight.ts',
  'src/app/api/decisions/log/route.ts',
  'src/app/api/decisions/ask/route.ts',
  'src/app/api/decisions/list/route.ts'
];

let out = "# Retrospect Backend Architecture\n\n";

for (const file of files) {
  out += "## " + file + "\n```typescript\n";
  out += fs.readFileSync(file, 'utf8');
  out += "\n```\n\n";
}

fs.writeFileSync('agent_api_logic.md', out);
console.log("File created: agent_api_logic.md");
