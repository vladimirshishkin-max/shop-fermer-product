require('dotenv').config();
const initSchema = require('./src/config/schema');
const app = require('./src/app');

initSchema();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});