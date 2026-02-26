const { readJson, writeJson } = require('../utils/fileDb');
const { USERS_FILE } = require('../utils/paths');
const { randomUUID } = require('crypto');
const { todayISO } = require('../utils/date');

async function getAll() {
  return readJson(USERS_FILE, []);
}

async function getById(id) {
  const users = await getAll();
  return users.find((u) => u.id === id);
}

async function findByEmail(email) {
  const users = await getAll();
  return users.find((u) => u.email === email);
}

async function create({ fullname, email, passwordHash, role }) {
  const users = await getAll();
  const newUser = {
    id: randomUUID(),
    fullname,
    email,
    passwordHash,
    role,
    createdAt: todayISO()
  };
  users.push(newUser);
  await writeJson(USERS_FILE, users);
  return newUser;
}

module.exports = {
  getAll,
  getById,
  findByEmail,
  create
};
