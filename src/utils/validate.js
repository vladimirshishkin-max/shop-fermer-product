const AppError = require('./AppError');

const bad = (msg) => new AppError(400, msg);

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw bad('Некорректный id');
  return id;
}

function requireString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw bad(`Поле "${field}" обязательно и должно быть строкой`);
  }
  return value.trim();
}

function optionalString(value, field) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw bad(`Поле "${field}" должно быть строкой`);
  return value.trim();
}

function requireInt(value, field, { min = 0 } = {}) {
  if (!Number.isInteger(value) || value < min) {
    throw bad(`Поле "${field}" должно быть целым числом не меньше ${min}`);
  }
  return value;
}

function optionalInt(value, field, opts) {
  if (value === undefined || value === null) return null;
  return requireInt(value, field, opts);
}

function requireNumber(value, field, { min = 0 } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min) {
    throw bad(`Поле "${field}" должно быть числом не меньше ${min}`);
  }
  return value;
}

function optionalNumber(value, field, opts) {
  if (value === undefined || value === null) return null;
  return requireNumber(value, field, opts);
}

module.exports = {
  parseId, requireString, optionalString,
  requireInt, optionalInt, requireNumber, optionalNumber,
};