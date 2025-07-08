import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs/promises';

export default {
  data: new SlashCommandBuilder()
    .setName('monitorar')
    .setDescription('🔧 | Adiciona ou remove uma aplicação para monitoramento.')
    .addStringOption(opt =>
      opt.setName('app_id')
        .setDescription('ID da aplicação da SquareCloud')
        .setRequired(true)
    )
    .addBooleanOption(opt =>
      opt.setName('remover')
        .setDescription('Marque como true para remover')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const appId = interaction.options.getString('app_id');
      const remover = interaction.options.getBoolean('remover') || false;

      if (!appId || appId.length < 10) {
        return interaction.editReply({
          content: '❌ | O ID fornecido é inválido. Verifique se copiou corretamente do painel da SquareCloud.'
        });
      }

      const raw = await fs.readFile('./config.json', 'utf-8');
      const config = JSON.parse(raw);

      if (!Array.isArray(config.applicationIds)) {
        return interaction.editReply({
          content: '⚠️ | O campo `applicationIds` está ausente ou inválido no config.json.'
        });
      }

      if (remover) {
        if (!config.applicationIds.includes(appId)) {
          return interaction.editReply({
            content: '⚠️ | Esta aplicação **não** está sendo monitorada.'
          });
        }

        config.applicationIds = config.applicationIds.filter(id => id !== appId);
        await fs.writeFile('./config.json', JSON.stringify(config, null, 2));
        return interaction.editReply(`✅️ | Aplicação \`${appId}\` **removida** do monitoramento.`);
      } else {
        if (config.applicationIds.includes(appId)) {
          return interaction.editReply({
            content: '⚠️ | Esta aplicação **já** está sendo monitorada.'
          });
        }

        config.applicationIds.push(appId);
        await fs.writeFile('./config.json', JSON.stringify(config, null, 2));
        return interaction.editReply(`✅ | Aplicação \`${appId}\` **adicionada** ao monitoramento.`);
      }
    } catch (err) {
      console.error('❌ | Erro ao executar o comando /monitorar:', err);
      return interaction.followUp({
        content: '❌ | Ocorreu um erro ao processar o comando. Verifique os logs do bot.',
        ephemeral: true
      });
    }
  }
};
