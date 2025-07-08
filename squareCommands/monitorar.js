import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs/promises';

export default {
  data: new SlashCommandBuilder()
    .setName('monitorar')
    .setDescription('🔧 | Adiciona ou remove uma aplicação para monitoramento.')
    .addStringOption(opt =>
      opt.setName('app_id')
        .setDescription('ID da aplicação')
        .setRequired(true)
    )
    .addBooleanOption(opt =>
      opt.setName('remover')
        .setDescription('Marque como true para remover')
        .setRequired(false)
    ),

  async execute(interaction) {
    const appId = interaction.options.getString('app_id');
    const remover = interaction.options.getBoolean('remover') || false;

    // 🔧 Lê o config dinamicamente
    const raw = await fs.readFile('./config.json', 'utf-8');
    const config = JSON.parse(raw);

    if (remover) {
      if (!config.applicationIds.includes(appId)) {
        return interaction.reply({ content: '⚠️ | Esta aplicação não está sendo monitorada.', ephemeral: true });
      }

      config.applicationIds = config.applicationIds.filter(id => id !== appId);
      await fs.writeFile('./config.json', JSON.stringify(config, null, 2));
      return interaction.reply(`✅️ | Aplicação \`${appId}\` removida do monitoramento.`);
    } else {
      if (config.applicationIds.includes(appId)) {
        return interaction.reply({ content: '⚠️ | Esta aplicação já está sendo monitorada.', ephemeral: true });
      }

      config.applicationIds.push(appId);
      await fs.writeFile('./config.json', JSON.stringify(config, null, 2));
      return interaction.reply(`✅ | Aplicação \`${appId}\` adicionada ao monitoramento.`);
    }
  }
};
