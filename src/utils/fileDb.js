const fs = require('fs/promises');
const path = require('path');

const writeQueues = new Map();

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function ensureFile(filePath, defaultValue) {
  try {
    await fs.access(filePath);
  } catch {
    await ensureDir(filePath);
    const initial = JSON.stringify(defaultValue, null, 2);
    await fs.writeFile(filePath, initial, 'utf8');
  }
}

async function readJson(filePath, defaultValue = []) {
  await ensureFile(filePath, defaultValue);
  const raw = await fs.readFile(filePath, 'utf8');
  const cleaned = raw.replace(/^\uFEFF/, '');
  if (!cleaned.trim()) {
    return defaultValue;
  }
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const err = new Error('Invalid JSON in ' + filePath);
    err.cause = error;
    throw err;
  }
}

function enqueue(filePath, task) {
  const prev = writeQueues.get(filePath) || Promise.resolve();
  const next = prev.then(task, task);
  writeQueues.set(filePath, next.catch(() => {}));
  return next;
}

async function writeJson(filePath, data) {
  await ensureDir(filePath);
  return enqueue(filePath, async () => {
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, json, 'utf8');
  });
}

module.exports = {
  readJson,
  writeJson
};



