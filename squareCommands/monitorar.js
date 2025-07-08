import { SlashCommandBuilder } from 'discord.js';
import config from '../config.json' assert { type: 'json' };
import fs from 'fs';

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

    if (remover) {
      if (!config.applicationIds.includes(appId)) {
        return interaction.reply({ content: '⚠️ | Esta aplicação não está sendo monitorada.', ephemeral: true });
      }
      config.applicationIds = config.applicationIds.filter(id => id !== appId);
      await fs.promises.writeFile('./config.json', JSON.stringify(config, null, 2));
      return interaction.reply(`✅️ | Aplicação \`${appId}\` removida do monitoramento.`);
    } else {
      if (config.applicationIds.includes(appId)) {
        return interaction.reply({ content: '⚠️ Esta aplicação já está sendo monitorada.', ephemeral: true });
      }
      config.applicationIds.push(appId);
      await fs.promises.writeFile('./config.json', JSON.stringify(config, null, 2));
      return interaction.reply(`✅ | Aplicação \`${appId}\` adicionada ao monitoramento.`);
    }
  }
};
