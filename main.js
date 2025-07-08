import { Client, GatewayIntentBits, Collection } from 'discord.js';
import config from './config.json' assert { type: 'json' };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkStatus } from './squareStatus/checkAppStatus.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅️ Carrega comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'squareCommands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = (await import(`file://${path.join(commandsPath, file)}`)).default;
  if (command && command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// 🔧 Carrega eventos
const eventsPath = path.join(__dirname, 'squareEvents');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = (await import(`file://${path.join(eventsPath, file)}`)).default;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// 🕒 Checagem periódica com atraso configurável
client.once('ready', () => {
  setInterval(() => {
    checkStatus(config, client);
  }, config.checkInterval);
});

client.login(config.discordToken);
