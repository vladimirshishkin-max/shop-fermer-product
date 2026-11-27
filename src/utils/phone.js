const AppError = require('./AppError');

function normalizePhone(value) {
  if (typeof value !== 'string') throw new AppError(400, 'Телефон обязателен');

  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) digits = '7' + digits.slice(1);
  if (digits.length === 10) digits = '7' + digits;

  if (!/^7\d{10}$/.test(digits)) {
    throw new AppError(400, 'Телефон должен быть российским, например +7 999 123-45-67');
  }
  return `+${digits}`;
}

module.exports = { normalizePhone };