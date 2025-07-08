import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkStatus } from './squareStatus/checkAppStatus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔁 Carrega config.json dinamicamente
const rawConfig = await fs.readFile('./config.json', 'utf-8');
const config = JSON.parse(rawConfig);

// 🧠 Cria cliente
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ✅️ Carrega comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'squareCommands');
const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = (await import(`file://${path.join(commandsPath, file)}`)).default;
  if (command?.data && command?.execute) {
    client.commands.set(command.data.name, command);
  }
}

// 🔧 Carrega eventos
const eventsPath = path.join(__dirname, 'squareEvents');
const eventFiles = (await fs.readdir(eventsPath)).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = (await import(`file://${path.join(eventsPath, file)}`)).default;
  if (event?.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// 🕒 Checagem periódica com atraso configurável
client.once('ready', async () => {
  // ▶️ Checagem
  setInterval(() => {
    checkStatus(config, client);
  }, config.checkInterval);

  // 📤 Executa deploy de comandos ao iniciar
  try {
    const { default: deploy } = await import('./deploy-commands.js');
    await deploy(config.clientId, config.discordToken);
    console.log('✅ | Comandos registrados com sucesso!');
  } catch (err) {
    console.error('❌ | Erro ao registrar comandos:', err);
  }
});

// 🚀 Login do bot
client.login(config.discordToken);
