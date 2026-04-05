'use strict';

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const axios    = require('axios');
const uploader = require('../utils/uploader');
const cooldown = require('../utils/cooldown');
const theme    = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('upload')
    .setDescription('Faz upload de um script e retorna o loadstring pronto')
    .addStringOption(o =>
      o.setName('destino')
        .setDescription('Onde hospedar?')
        .setRequired(true)
        .addChoices(
          { name: 'Pastebin',           value: 'pastebin' },
          { name: 'Pastefy',            value: 'pastefy'  },
          { name: 'Pastebin + Pastefy', value: 'ambos'    },
        ))
    .addStringOption(o =>
      o.setName('codigo').setDescription('Cole o script aqui').setRequired(false))
    .addAttachmentOption(o =>
      o.setName('arquivo').setDescription('Envie um arquivo .lua ou .txt').setRequired(false))
    .addStringOption(o =>
      o.setName('titulo').setDescription('Titulo do paste (opcional)').setRequired(false)),

  async execute(interaction) {
    const rem = cooldown.check(interaction.user.id, 'upload', 10);
    if (rem > 0)
      return interaction.reply({ embeds: [theme.error(`Aguarde ${rem}s antes de usar novamente.`)], ephemeral: true });

    const destino = interaction.options.getString('destino');
    const code    = interaction.options.getString('codigo');
    const attach  = interaction.options.getAttachment('arquivo');
    const titulo  = interaction.options.getString('titulo') || 'Script';

    if (!code && !attach)
      return interaction.reply({ embeds: [theme.error('Forneca o codigo ou um arquivo .lua / .txt')], ephemeral: true });

    await interaction.deferReply();

    let input = code || '';

    if (attach) {
      const valid = ['.lua', '.txt', '.luac'].some(e => attach.name.toLowerCase().endsWith(e));
      if (!valid)
        return interaction.editReply({ embeds: [theme.error('Formato invalido. Use .lua ou .txt')] });
      if (attach.size > 512000)
        return interaction.editReply({ embeds: [theme.error('Arquivo muito grande. Maximo: 500KB.')] });
      try {
        const r = await axios.get(attach.url, { timeout: 10000, responseType: 'text' });
        input = r.data;
      } catch {
        return interaction.editReply({ embeds: [theme.error('Nao foi possivel baixar o arquivo.')] });
      }
    }

    if (input.length > 500000)
      return interaction.editReply({ embeds: [theme.error('Script muito grande. Maximo: 500KB.')] });

    const embed = theme.success('Upload concluido', null)
      .addFields({ name: 'Tamanho', value: `${input.length.toLocaleString()} chars`, inline: true })
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

    const loadstrings = [];

    if (destino === 'pastebin' || destino === 'ambos') {
      try {
        const r = await uploader.uploadPastebin(input, titulo);
        embed.addFields(
          { name: 'Pastebin', value: r.url, inline: false },
          { name: 'Loadstring Pastebin', value: `\`\`\`lua\n${r.loadstring}\n\`\`\``, inline: false },
        );
        loadstrings.push(r.loadstring);
      } catch (e) {
        embed.addFields({ name: 'Pastebin — Erro', value: e.message, inline: false });
      }
    }

    if (destino === 'pastefy' || destino === 'ambos') {
      try {
        const r = await uploader.uploadPastefy(input, titulo);
        embed.addFields(
          { name: 'Pastefy', value: r.url, inline: false },
          { name: 'Loadstring Pastefy', value: `\`\`\`lua\n${r.loadstring}\n\`\`\``, inline: false },
        );
        loadstrings.push(r.loadstring);
      } catch (e) {
        embed.addFields({ name: 'Pastefy — Erro', value: e.message, inline: false });
      }
    }

    const files = [];
    if (loadstrings.length > 0) {
      const buf = Buffer.from(loadstrings.join('\n\n'), 'utf-8');
      files.push(new AttachmentBuilder(buf, { name: 'loadstrings.txt' }));
    }

    await interaction.editReply({ embeds: [embed], files });
  },
};
