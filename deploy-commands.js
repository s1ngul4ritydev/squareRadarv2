import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, 'squareCommands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('📦 | Iniciando deploy dos comandos...\n');

for (const file of commandFiles) {
  try {
    const command = (await import(`file://${path.join(commandsPath, file)}`)).default;

    if (!command?.data?.name || typeof command.execute !== 'function') {
      console.warn(`⚠️ | Comando ignorado (incompleto ou inválido): ${file}`);
      continue;
    }

    commands.push(command.data.toJSON());
    console.log(`✅ | Carregado: ${command.data.name}`);
  } catch (err) {
    console.error(`❌ | Erro ao carregar ${file}:`, err);
  }
}

const rest = new REST({ version: '10' }).setToken(config.discordToken);

(async () => {
  try {
    console.log('\n🚀 | Enviando comandos para o Discord...');

    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );

    console.log(`✅ | Deploy concluído com sucesso! Total: ${commands.length} comandos.`);
  } catch (error) {
    console.error('🚫 | Erro ao deployar comandos:', error);
  }
})();
