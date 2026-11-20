const productModel = require('../models/productModel');
const AppError = require('../utils/AppError');
const { rubToKop, kopToRub } = require('../utils/money');
const {
  parseId, requireString, optionalString, requireInt, optionalInt,
  requireNumber, optionalNumber,
} = require('../utils/validate');

// В БД цена в копейках, наружу отдаём рубли
function toDto(row) {
  const { price_kop, ...rest } = row;
  return { ...rest, price: kopToRub(price_kop), is_active: Boolean(row.is_active) };
}

function parseProductBody(body = {}) {
  return {
    category_id: requireInt(body.category_id, 'category_id', { min: 1 }),
    farm_id: requireInt(body.farm_id, 'farm_id', { min: 1 }),
    unit_id: requireInt(body.unit_id, 'unit_id', { min: 1 }),
    name: requireString(body.name, 'name'),
    description: optionalString(body.description, 'description'),
    image_url: optionalString(body.image_url, 'image_url'),
    price_kop: rubToKop(requireNumber(body.price, 'price')),
    pack_size: optionalNumber(body.pack_size, 'pack_size'),
    proteins: optionalNumber(body.proteins, 'proteins'),
    fats: optionalNumber(body.fats, 'fats'),
    carbs: optionalNumber(body.carbs, 'carbs'),
    composition: optionalString(body.composition, 'composition'),
    shelf_life_days: optionalInt(body.shelf_life_days, 'shelf_life_days', { min: 1 }),
    stock: body.stock === undefined ? 0 : requireInt(body.stock, 'stock', { min: 0 }),
    is_active: body.is_active === undefined ? 1 : (body.is_active ? 1 : 0),
  };
}

exports.list = (req, res) => {
  const { category_id, farm_id, search, include_inactive } = req.query;
  const rows = productModel.getAll({
    categoryId: category_id !== undefined ? parseId(category_id) : undefined,
    farmId: farm_id !== undefined ? parseId(farm_id) : undefined,
    search: typeof search === 'string' && search.trim() ? search.trim() : undefined,
    includeInactive: include_inactive === 'true', // позже оставим только админу
  });
  res.json(rows.map(toDto));
};

exports.getOne = (req, res) => {
  const row = productModel.getById(parseId(req.params.id));
  if (!row) throw new AppError(404, 'Товар не найден');
  res.json(toDto(row));
};

exports.create = (req, res) => {
  const row = productModel.create(parseProductBody(req.body));
  res.status(201).json(toDto(row));
};

exports.update = (req, res) => {
  const row = productModel.update(parseId(req.params.id), parseProductBody(req.body));
  if (!row) throw new AppError(404, 'Товар не найден');
  res.json(toDto(row));
};

// Товар не удаляется физически: на него ссылаются старые заказы
exports.remove = (req, res) => {
  if (!productModel.deactivate(parseId(req.params.id))) {
    throw new AppError(404, 'Товар не найден');
  }
  res.status(204).end();
};