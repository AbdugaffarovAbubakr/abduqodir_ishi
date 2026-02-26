const { readJson, writeJson } = require('../utils/fileDb');
const { DEVICES_FILE } = require('../utils/paths');
const { randomUUID } = require('crypto');
const { todayISO } = require('../utils/date');

async function getAll() {
  return readJson(DEVICES_FILE, []);
}

async function getById(id) {
  const devices = await getAll();
  return devices.find((d) => d.id === id);
}

async function create(data) {
  const devices = await getAll();
  const newDevice = {
    id: randomUUID(),
    ...data,
    createdAt: todayISO()
  };
  devices.push(newDevice);
  await writeJson(DEVICES_FILE, devices);
  return newDevice;
}

async function update(id, patch) {
  const devices = await getAll();
  const index = devices.findIndex((d) => d.id === id);
  if (index === -1) {
    return null;
  }
  const current = devices[index];
  const updated = {
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt
  };
  devices[index] = updated;
  await writeJson(DEVICES_FILE, devices);
  return updated;
}

async function remove(id) {
  const devices = await getAll();
  const index = devices.findIndex((d) => d.id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = devices.splice(index, 1);
  await writeJson(DEVICES_FILE, devices);
  return removed;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
