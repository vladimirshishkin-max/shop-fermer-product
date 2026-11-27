const db = require('../config/db');

const PUBLIC_FIELDS = 'id, phone, full_name, role, created_at';

const userModel = {
  findById(id) {
    return db.prepare(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`).get(id);
  },
  findAuthByPhone(phone) {
    return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  },
  create({ phone, passwordHash, fullName, role = 'customer' }) {
    const info = db
      .prepare('INSERT INTO users (phone, password_hash, full_name, role) VALUES (?, ?, ?, ?)')
      .run(phone, passwordHash, fullName, role);
    return userModel.findById(info.lastInsertRowid);
  },
};

module.exports = userModel;