'use strict';
const C = { r:'\x1b[0m', b:'\x1b[1m', red:'\x1b[31m', green:'\x1b[32m', cyan:'\x1b[36m', gray:'\x1b[90m' };
const ts = () => new Date().toISOString().replace('T',' ').slice(0,19);
const log = (l, c, m) => console.log(`${C.gray}[${ts()}]${C.r} ${c}${C.b}[${l}]${C.r} ${m}`);
module.exports = {
  info:    m => log('INFO ', C.cyan,  m),
  success: m => log('OK   ', C.green, m),
  error:   m => log('ERROR', C.red,   m),
};
