const AppError = require('../utils/AppError');

function notFound(req, res) {
  res.status(404).json({ error: 'Маршрут не найден' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
  }
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Такая запись уже существует' });
  }
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(409).json({
      error: 'Нарушена связь: запись используется в других данных или ссылается на несуществующую',
    });
  }
  if (typeof err.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
    return res.status(400).json({ error: 'Данные нарушают ограничения базы' });
  }
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}

module.exports = { notFound, errorHandler };