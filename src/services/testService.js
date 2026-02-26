const { readJson, writeJson } = require('../utils/fileDb');
const { TESTS_FILE } = require('../utils/paths');
const { randomUUID } = require('crypto');

async function getAll() {
  return readJson(TESTS_FILE, []);
}

async function getByDeviceId(deviceId) {
  const tests = await getAll();
  return tests.filter((t) => t.deviceId === deviceId);
}

async function getById(id) {
  const tests = await getAll();
  return tests.find((t) => t.id === id);
}

async function create(data) {
  const tests = await getAll();
  const newTest = {
    id: randomUUID(),
    ...data
  };
  tests.push(newTest);
  await writeJson(TESTS_FILE, tests);
  return newTest;
}

async function remove(id) {
  const tests = await getAll();
  const index = tests.findIndex((t) => t.id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = tests.splice(index, 1);
  await writeJson(TESTS_FILE, tests);
  return removed;
}

module.exports = {
  getAll,
  getByDeviceId,
  getById,
  create,
  update,
  remove
};

async function update(id, patch) {
  const tests = await getAll();
  const index = tests.findIndex((t) => t.id === id);
  if (index === -1) {
    return null;
  }
  const current = tests[index];
  const updated = {
    ...current,
    ...patch,
    id: current.id
  };
  tests[index] = updated;
  await writeJson(TESTS_FILE, tests);
  return updated;
}
