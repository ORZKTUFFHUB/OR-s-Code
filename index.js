require('dotenv').config();

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs     = require('fs');
const path   = require('path');
const logger = require('./utils/logger');

if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID) {
  logger.error('BOT_TOKEN e CLIENT_ID sao obrigatorios no .env');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandsData = [];

for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(commandsPath, file));
  if (!cmd.data || !cmd.execute) continue;
  client.commands.set(cmd.data.name, cmd);
  commandsData.push(cmd.data.toJSON());
  logger.info(`Comando carregado: /${cmd.data.name}`);
}

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  try {
    logger.info(`Registrando ${commandsData.length} comando(s)...`);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsData });
    logger.success(`${commandsData.length} comando(s) registrado(s)!`);
  } catch (err) {
    logger.error('Erro ao registrar: ' + err.message);
  }
}

client.once('ready', async () => {
  logger.success(`Bot online: ${client.user.tag}`);
  client.user.setActivity('/upload | /obfuscate', { type: 3 });
  await registerCommands();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    logger.info(`[CMD] /${interaction.commandName} | ${interaction.user.tag}`);
    await command.execute(interaction);
  } catch (err) {
    logger.error(`Erro em /${interaction.commandName}: ${err.message}`);
    const p = { content: 'Erro ao executar o comando.', ephemeral: true };
    interaction.replied || interaction.deferred ? await interaction.followUp(p) : await interaction.reply(p);
  }
});

client.on('error', err => logger.error('Client: ' + err.message));
process.on('unhandledRejection', err => logger.error('Unhandled: ' + err.message));

client.login(process.env.BOT_TOKEN);
