const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');

function readToken(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

function resolveUser(token) {
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw new AppError(401, 'Недействительный или просроченный токен');
  }
  // Роль берём из БД, а не из токена: если права изменились, токен не даёт лишнего
  const user = userModel.findById(payload.sub);
  if (!user) throw new AppError(401, 'Пользователь не найден');
  return user;
}

// Токен обязателен
function authenticate(req, res, next) {
  const token = readToken(req);
  if (!token) throw new AppError(401, 'Требуется авторизация');
  req.user = resolveUser(token);
  next();
}

// Токен необязателен: для публичных маршрутов, где админ видит больше
function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) req.user = resolveUser(token);
  next();
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) throw new AppError(401, 'Требуется авторизация');
  if (!roles.includes(req.user.role)) throw new AppError(403, 'Недостаточно прав');
  next();
};

module.exports = { authenticate, optionalAuth, requireRole };