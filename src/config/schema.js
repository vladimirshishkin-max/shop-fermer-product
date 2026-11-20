const db = require('./db');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS units (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS farms (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS order_statuses (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS delivery_zones (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      conditions TEXT
    );

    CREATE TABLE IF NOT EXISTS streets (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      zone_id INTEGER NOT NULL,
      name    TEXT NOT NULL UNIQUE,
      FOREIGN KEY (zone_id) REFERENCES delivery_zones(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      phone         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name     TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'customer'
                    CHECK (role IN ('customer', 'admin')),
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER NOT NULL,
      street_id INTEGER NOT NULL,
      house     TEXT NOT NULL,
      building  TEXT,
      apartment TEXT,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
      FOREIGN KEY (street_id) REFERENCES streets(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS products (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id     INTEGER NOT NULL,
      farm_id         INTEGER NOT NULL,
      unit_id         INTEGER NOT NULL,
      name            TEXT NOT NULL,
      description     TEXT,
      image_url       TEXT,
      price_kop       INTEGER NOT NULL CHECK (price_kop >= 0),
      pack_size       REAL CHECK (pack_size > 0),
      proteins        REAL,
      fats            REAL,
      carbs           REAL,
      composition     TEXT,
      shelf_life_days INTEGER CHECK (shelf_life_days > 0),
      stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      is_active       INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
      FOREIGN KEY (farm_id)     REFERENCES farms(id)      ON DELETE RESTRICT,
      FOREIGN KEY (unit_id)     REFERENCES units(id)      ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity   INTEGER NOT NULL CHECK (quantity > 0),
      UNIQUE (user_id, product_id),
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      UNIQUE (user_id, product_id),
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL,
      address_id   INTEGER NOT NULL,
      status_id    INTEGER NOT NULL DEFAULT 1,
      order_number TEXT NOT NULL UNIQUE,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      total_kop    INTEGER NOT NULL CHECK (total_kop >= 0),
      comment      TEXT,
      FOREIGN KEY (user_id)    REFERENCES users(id)          ON DELETE RESTRICT,
      FOREIGN KEY (address_id) REFERENCES addresses(id)      ON DELETE RESTRICT,
      FOREIGN KEY (status_id)  REFERENCES order_statuses(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id              INTEGER NOT NULL,
      product_id            INTEGER NOT NULL,
      quantity              INTEGER NOT NULL CHECK (quantity > 0),
      price_kop_at_purchase INTEGER NOT NULL CHECK (price_kop_at_purchase >= 0),
      UNIQUE (order_id, product_id),
      FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_farm     ON products(farm_id);
    CREATE INDEX IF NOT EXISTS idx_streets_zone      ON streets(zone_id);
    CREATE INDEX IF NOT EXISTS idx_addresses_user    ON addresses(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

    INSERT OR IGNORE INTO order_statuses (name) VALUES
      ('Принят'), ('В доставке'), ('Доставлен'), ('Отменён');

    INSERT OR IGNORE INTO units (name) VALUES ('кг'), ('шт'), ('л');
  `);

  console.log('БД инициализирована');
}

module.exports = initSchema;