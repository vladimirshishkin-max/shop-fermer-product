require('dotenv').config();
const db = require('./db');
const initSchema = require('./schema');

initSchema();

const seed = db.transaction(() => {
  const addCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  ['Овощи', 'Фрукты', 'Молочные продукты', 'Мёд'].forEach((n) => addCategory.run(n));

  const addFarm = db.prepare('INSERT OR IGNORE INTO farms (name, description) VALUES (?, ?)');
  addFarm.run('Ферма «Заречье»', 'Овощи и зелень');
  addFarm.run('Ферма «Луговая»', 'Молочная продукция');

  const addZone = db.prepare('INSERT OR IGNORE INTO delivery_zones (name, conditions) VALUES (?, ?)');
  addZone.run('Центр', 'Доставка в день заказа');
  addZone.run('Окраины', 'Доставка на следующий день');

  const addStreet = db.prepare(
    'INSERT OR IGNORE INTO streets (zone_id, name) VALUES ((SELECT id FROM delivery_zones WHERE name = ?), ?)'
  );
  addStreet.run('Центр', 'Ленина');
  addStreet.run('Центр', 'Мира');
  addStreet.run('Окраины', 'Заводская');

  const productsCount = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
  if (productsCount === 0) {
    const addProduct = db.prepare(`
      INSERT INTO products (category_id, farm_id, unit_id, name, price_kop, pack_size, stock)
      VALUES (
        (SELECT id FROM categories WHERE name = ?),
        (SELECT id FROM farms WHERE name = ?),
        (SELECT id FROM units WHERE name = ?),
        ?, ?, ?, ?
      )
    `);
    addProduct.run('Овощи', 'Ферма «Заречье»', 'кг', 'Картофель', 7900, 1, 100);
    addProduct.run('Овощи', 'Ферма «Заречье»', 'кг', 'Морковь', 8990, 1, 80);
    addProduct.run('Молочные продукты', 'Ферма «Луговая»', 'л', 'Молоко цельное', 12000, 1, 40);
    addProduct.run('Мёд', 'Ферма «Луговая»', 'шт', 'Мёд цветочный', 45000, 0.5, 25);
  }
});

seed();
console.log('Тестовые данные добавлены');