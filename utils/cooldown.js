'use strict';
const store = new Map();
function check(userId, cmd, seconds) {
  const key = `${userId}:${cmd}`, now = Date.now(), exp = store.get(key) || 0;
  if (now < exp) return Math.ceil((exp - now) / 1000);
  store.set(key, now + seconds * 1000);
  return 0;
}
setInterval(() => { const n = Date.now(); for (const [k, v] of store) if (v < n) store.delete(k); }, 300000);
module.exports = { check };
