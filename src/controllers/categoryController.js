const categoryModel = require('../models/categoryModel');
const AppError = require('../utils/AppError');
const { parseId, requireString } = require('../utils/validate');

exports.list = (req, res) => {
  res.json(categoryModel.getAll());
};

exports.getOne = (req, res) => {
  const category = categoryModel.getById(parseId(req.params.id));
  if (!category) throw new AppError(404, 'Категория не найдена');
  res.json(category);
};

exports.create = (req, res) => {
  const name = requireString((req.body ?? {}).name, 'name');
  res.status(201).json(categoryModel.create(name));
};

exports.update = (req, res) => {
  const id = parseId(req.params.id);
  const name = requireString((req.body ?? {}).name, 'name');
  const category = categoryModel.update(id, name);
  if (!category) throw new AppError(404, 'Категория не найдена');
  res.json(category);
};

exports.remove = (req, res) => {
  const removed = categoryModel.remove(parseId(req.params.id));
  if (!removed) throw new AppError(404, 'Категория не найдена');
  res.status(204).end();
};