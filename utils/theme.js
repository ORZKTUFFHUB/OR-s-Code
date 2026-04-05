'use strict';

const { EmbedBuilder } = require('discord.js');

const C = { primary: 0xE53935, success: 0xC62828, error: 0xB71C1C };

const base = color => new EmbedBuilder().setColor(color).setFooter({ text: 'Lua Bot' }).setTimestamp();

module.exports = {
  success: (title, desc) => base(C.success).setTitle(title).setDescription(desc || null),
  error:   desc           => base(C.error).setDescription(String(desc)),
  primary: (title, desc)  => base(C.primary).setTitle(title).setDescription(desc || null),
};
