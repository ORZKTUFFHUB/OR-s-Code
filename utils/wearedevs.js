'use strict';

const axios = require('axios');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Origin':     'https://wearedevs.net',
  'Referer':    'https://wearedevs.net/obfuscator',
};

async function obfuscate(code) {
  // Tentativa 1 — API direta
  try {
    const params = new URLSearchParams();
    params.append('script', code);

    const res = await axios.post('https://wearedevs.net/api/obfuscator', params, {
      headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000,
    });

    const data = res.data;
    if (typeof data === 'string' && data.length > 10) return { success: true, output: data };
    if (data?.script)  return { success: true, output: data.script };
    if (data?.result)  return { success: true, output: data.result };
    if (data?.output)  return { success: true, output: data.output };
    if (data?.success === false) return { success: false, error: data.message || 'WeAreDevs recusou.' };
  } catch {}

  // Tentativa 2 — rota alternativa
  try {
    const form = new URLSearchParams();
    form.append('script', code);

    const res = await axios.post('https://wearedevs.net/obfuscator', form, {
      headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
      timeout: 30000,
    });

    const data = res.data;
    if (typeof data === 'string' && data.length > 10) return { success: true, output: data };
    if (data?.script) return { success: true, output: data.script };
  } catch (e) {
    return { success: false, error: 'Falha ao conectar com WeAreDevs: ' + e.message };
  }

  return { success: false, error: 'Nao foi possivel obter resposta valida do WeAreDevs.' };
}

module.exports = { obfuscate };
