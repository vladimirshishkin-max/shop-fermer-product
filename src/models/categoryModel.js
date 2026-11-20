const db = require('../config/db');

const categoryModel = {
  getAll() {
    return db.prepare('SELECT id, name FROM categories ORDER BY name').all();
  },
  getById(id) {
    return db.prepare('SELECT id, name FROM categories WHERE id = ?').get(id);
  },
  create(name) {
    const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    return categoryModel.getById(info.lastInsertRowid);
  },
  update(id, name) {
    const info = db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
    return info.changes > 0 ? categoryModel.getById(id) : null;
  },
  remove(id) {
    return db.prepare('DELETE FROM categories WHERE id = ?').run(id).changes > 0;
  },
};

module.exports = categoryModel;