const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/config');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const { normalizePhone } = require('../utils/phone');
const { requireString } = require('../utils/validate');

// Нужен, чтобы вход с несуществующим телефоном занимал столько же времени, как и с существующим
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

function checkPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError(400, 'Пароль должен быть не короче 8 символов');
  }
  // bcrypt учитывает только первые 72 байта
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new AppError(400, 'Пароль слишком длинный (максимум 72 байта)');
  }
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, {
    algorithm: 'HS256',
    expiresIn: jwtExpiresIn,
  });
}

async function register({ phone, password, full_name }) {
  const normalized = normalizePhone(phone);
  const fullName = requireString(full_name, 'full_name');
  checkPassword(password);

  if (userModel.findAuthByPhone(normalized)) {
    throw new AppError(409, 'Пользователь с таким телефоном уже зарегистрирован');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = userModel.create({ phone: normalized, passwordHash, fullName });
  return { user, token: signToken(user) };
}

async function login({ phone, password }) {
  const normalized = normalizePhone(phone);
  if (typeof password !== 'string') throw new AppError(400, 'Пароль обязателен');

  const row = userModel.findAuthByPhone(normalized);
  const passwordOk = await bcrypt.compare(password, row ? row.password_hash : DUMMY_HASH);

  // Одно и то же сообщение для обоих случаев: нельзя подсказывать, какой телефон зарегистрирован
  if (!row || !passwordOk) throw new AppError(401, 'Неверный телефон или пароль');

  const user = userModel.findById(row.id);
  return { user, token: signToken(user) };
}

module.exports = { register, login };