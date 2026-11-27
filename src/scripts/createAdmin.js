require('dotenv').config();
const bcrypt = require('bcryptjs');
const initSchema = require('../config/schema');
const userModel = require('../models/userModel');
const { normalizePhone } = require('../utils/phone');

const [phoneArg, nameArg, passwordArg] = process.argv.slice(2);

if (!phoneArg || !nameArg || !passwordArg) {
  console.error('Использование: npm run create-admin -- "+79991234567" "Имя Фамилия" \'пароль\'');
  process.exit(1);
}

try {
  initSchema();
  const phone = normalizePhone(phoneArg);

  if (userModel.findAuthByPhone(phone)) {
    console.error('Пользователь с таким телефоном уже существует');
    process.exit(1);
  }
  if (passwordArg.length < 8) {
    console.error('Пароль должен быть не короче 8 символов');
    process.exit(1);
  }

  const user = userModel.create({
    phone,
    passwordHash: bcrypt.hashSync(passwordArg, 10),
    fullName: nameArg.trim(),
    role: 'admin',
  });
  console.log('Администратор создан:', user);
} catch (err) {
  console.error('Ошибка:', err.message);
  process.exit(1);
}
