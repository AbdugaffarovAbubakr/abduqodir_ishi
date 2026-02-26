const path = require('path');

const SRC_DIR = path.join(__dirname, '..');
const DB_DIR = path.join(SRC_DIR, 'database');

const USERS_FILE = path.join(DB_DIR, 'users.json');
const DEVICES_FILE = path.join(DB_DIR, 'devices.json');
const TESTS_FILE = path.join(DB_DIR, 'tests.json');
const RESULTS_FILE = path.join(DB_DIR, 'results.json');

module.exports = {
  SRC_DIR,
  DB_DIR,
  USERS_FILE,
  DEVICES_FILE,
  TESTS_FILE,
  RESULTS_FILE
};
