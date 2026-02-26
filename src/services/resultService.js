const { readJson, writeJson } = require('../utils/fileDb');
const { RESULTS_FILE } = require('../utils/paths');
const { randomUUID } = require('crypto');
const { todayISO } = require('../utils/date');

async function getAll() {
  return readJson(RESULTS_FILE, []);
}

async function getByUserId(userId) {
  const results = await getAll();
  return results.filter((r) => r.userId === userId);
}

async function create({ userId, deviceId, score, total, percentage }) {
  const results = await getAll();
  const newResult = {
    id: randomUUID(),
    userId,
    deviceId,
    score,
    total,
    percentage,
    date: todayISO()
  };
  results.push(newResult);
  await writeJson(RESULTS_FILE, results);
  return newResult;
}

module.exports = {
  getAll,
  getByUserId,
  create
};
