const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 16) {
  throw new Error('JWT_SECRET не задан в .env (нужна строка от 16 символов)');
}

module.exports = {
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};