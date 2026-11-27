const authService = require('../services/authService');

exports.register = async (req, res) => {
  res.status(201).json(await authService.register(req.body ?? {}));
};

exports.login = async (req, res) => {
  res.json(await authService.login(req.body ?? {}));
};

exports.me = (req, res) => {
  res.json(req.user);
};