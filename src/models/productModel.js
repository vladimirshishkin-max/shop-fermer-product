const db = require('../config/db');

const SELECT = `
  SELECT p.id, p.name, p.description, p.image_url, p.price_kop, p.pack_size,
         p.proteins, p.fats, p.carbs, p.composition, p.shelf_life_days,
         p.stock, p.is_active, p.created_at,
         p.category_id, c.name AS category_name,
         p.farm_id,     f.name AS farm_name,
         p.unit_id,     u.name AS unit_name
  FROM products p
  JOIN categories c ON c.id = p.category_id
  JOIN farms f      ON f.id = p.farm_id
  JOIN units u      ON u.id = p.unit_id
`;

const INSERT = `
  INSERT INTO products
    (category_id, farm_id, unit_id, name, description, image_url, price_kop, pack_size,
     proteins, fats, carbs, composition, shelf_life_days, stock, is_active)
  VALUES
    (@category_id, @farm_id, @unit_id, @name, @description, @image_url, @price_kop, @pack_size,
     @proteins, @fats, @carbs, @composition, @shelf_life_days, @stock, @is_active)
`;

const UPDATE = `
  UPDATE products SET
    category_id = @category_id, farm_id = @farm_id, unit_id = @unit_id,
    name = @name, description = @description, image_url = @image_url,
    price_kop = @price_kop, pack_size = @pack_size,
    proteins = @proteins, fats = @fats, carbs = @carbs,
    composition = @composition, shelf_life_days = @shelf_life_days,
    stock = @stock, is_active = @is_active
  WHERE id = @id
`;

const productModel = {
  getAll({ categoryId, farmId, search, includeInactive } = {}) {
    const where = [];
    const params = [];
    if (!includeInactive) where.push('p.is_active = 1');
    if (categoryId) { where.push('p.category_id = ?'); params.push(categoryId); }
    if (farmId)     { where.push('p.farm_id = ?');     params.push(farmId); }
    if (search)     { where.push('p.name LIKE ?');     params.push(`%${search}%`); }

    const sql = SELECT
      + (where.length ? ` WHERE ${where.join(' AND ')}` : '')
      + ' ORDER BY p.name';
    return db.prepare(sql).all(...params);
  },

  getById(id) {
    return db.prepare(`${SELECT} WHERE p.id = ?`).get(id);
  },

  create(data) {
    const info = db.prepare(INSERT).run(data);
    return productModel.getById(info.lastInsertRowid);
  },

  update(id, data) {
    const info = db.prepare(UPDATE).run({ ...data, id });
    return info.changes > 0 ? productModel.getById(id) : null;
  },

  deactivate(id) {
    return db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id).changes > 0;
  },
};

module.exports = productModel;