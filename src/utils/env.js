const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '1d';

module.exports = {
  PORT,
  JWT_SECRET,
  TOKEN_EXPIRES_IN
};
