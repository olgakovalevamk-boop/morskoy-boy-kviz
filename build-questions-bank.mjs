#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');

function loadJson(name) {
  const p = path.join(dataDir, name);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function dedupe(pool) {
  const seen = new Set();
  return pool.filter(([q]) => {
    if (seen.has(q)) return false;
    seen.add(q);
    return true;
  });
}

function filterBanned(pool) {
  const banned = [
    /что произошло раньше/i,
    /раньше остальных/i,
    /какое число больше/i,
    /чётное|четное число/i,
    /в каком десятилетии/i,
    /^\d+\s*[\+\-\×x·]\s*\d+\s*=\s*\?$/i,
    /^[\d\s\+\-\×÷\^]+\s*=\s*\?$/i,
    /— вид спорта\?$/i
  ];
  return pool.filter(([q]) => !banned.some(re => re.test(q)));
}

function mergePools(...arrays) {
  return dedupe(filterBanned(arrays.flat()));
}

const MATH_FACTS = {
  easy: mergePools(loadJson('math-easy.json')),
  medium: mergePools(loadJson('math-medium.json')),
  hard: mergePools(loadJson('math-hard.json'))
};

const HISTORY_FACTS = {
  easy: mergePools(loadJson('history-easy.json')),
  medium: mergePools(loadJson('history-medium.json')),
  hard: mergePools(loadJson('history-hard.json'))
};

const SPORT_FACTS = {
  easy: mergePools(loadJson('sport-easy.json')),
  medium: mergePools(loadJson('sport-medium.json')),
  hard: mergePools(loadJson('sport-hard.json'))
};

function check(name, facts) {
  for (const lvl of ['easy', 'medium', 'hard']) {
    const n = facts[lvl].length;
    const status = n >= 100 ? 'OK' : 'LOW';
    console.log(`${status} ${name}.${lvl}: ${n}`);
  }
}

check('MATH', MATH_FACTS);
check('HISTORY', HISTORY_FACTS);
check('SPORT', SPORT_FACTS);

const out = `// Автособранный банк — node data/seed-banks.mjs && node data/seed-sport.mjs && node build-questions-bank.mjs
// Формат: ["Вопрос?", "ответ", ["невер1","невер2","невер3"]]

const MATH_FACTS = ${JSON.stringify(MATH_FACTS, null, 2)};

const HISTORY_FACTS = ${JSON.stringify(HISTORY_FACTS, null, 2)};

const SPORT_FACTS = ${JSON.stringify(SPORT_FACTS, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'questions-bank.js'), out, 'utf8');
console.log('Written questions-bank.js');
