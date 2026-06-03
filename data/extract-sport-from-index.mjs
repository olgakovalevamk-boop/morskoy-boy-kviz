#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/const SPORT_FACTS = (\{[\s\S]*?\n    \});\s*\n\s*const SPORT_EXTRA/);
if (!m) throw new Error('SPORT_FACTS not found');
const facts = eval('(' + m[1] + ')');
const extraM = html.match(/const SPORT_EXTRA = (\{[\s\S]*?\n    \});\s*\n\s*const HISTORY_YEARS/);
const extra = extraM ? eval('(' + extraM[1] + ')') : {};
for (const lvl of ['easy', 'medium', 'hard']) {
  const all = [...(facts[lvl] || []), ...((extra[lvl]) || [])];
  fs.writeFileSync(path.join(__dirname, `sport-${lvl}.json`), JSON.stringify(all, null, 2));
  console.log(`sport-${lvl}.json:`, all.length);
}
