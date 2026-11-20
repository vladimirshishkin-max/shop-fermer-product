const rubToKop = (rub) => Math.round(rub * 100);
const kopToRub = (kop) => kop / 100;

module.exports = { rubToKop, kopToRub };