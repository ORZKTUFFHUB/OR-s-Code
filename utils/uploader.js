'use strict';

const axios = require('axios');

async function uploadPastebin(content, title = 'Script') {
  const key = process.env.PASTEBIN_API_KEY;
  if (!key) throw new Error('PASTEBIN_API_KEY nao configurada no .env');

  const params = new URLSearchParams();
  params.append('api_dev_key',           key);
  params.append('api_option',            'paste');
  params.append('api_paste_code',        content);
  params.append('api_paste_name',        title);
  params.append('api_paste_format',      'lua');
  params.append('api_paste_expire_date', 'N');
  params.append('api_paste_private',     '0');

  const res = await axios.post('https://pastebin.com/api/api_post.php', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 10000,
  });

  if (!res.data || !res.data.startsWith('https://'))
    throw new Error('Pastebin recusou: ' + res.data);

  const pasteId = res.data.trim().replace('https://pastebin.com/', '');
  const rawUrl  = `https://pastebin.com/raw/${pasteId}`;

  return {
    url:        res.data.trim(),
    rawUrl,
    loadstring: `loadstring(game:HttpGet("${rawUrl}"))()`,
  };
}

async function uploadPastefy(content, title = 'Script') {
  const key = process.env.PASTEFY_API_KEY;
  if (!key) throw new Error('PASTEFY_API_KEY nao configurada no .env');

  const res = await axios.post('https://pastefy.app/api/v2/paste', {
    title,
    content,
    type:       'PASTE',
    visibility: 'UNLISTED',
  }, {
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type':  'application/json',
    },
    timeout: 10000,
  });

  if (!res.data?.paste?.id)
    throw new Error('Resposta inesperada do Pastefy');

  const pasteId = res.data.paste.id;
  const url     = `https://pastefy.app/${pasteId}`;

  return {
    url,
    rawUrl:     `https://pastefy.app/${pasteId}/raw`,
    loadstring: `loadstring(game:HttpGet("${url}"))()`,
  };
}

module.exports = { uploadPastebin, uploadPastefy };
