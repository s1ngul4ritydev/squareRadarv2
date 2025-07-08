import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';

const appsFile = path.resolve('squareData/apps.json');

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

      // 📥 Carrega os dados de apps.json
      let appsData = { applicationIds: [] };
      try {
        const raw = await fs.readFile(appsFile, 'utf-8');
        appsData = JSON.parse(raw);
      } catch (err) {
        console.warn('⚠️ | apps.json não encontrado ou inválido, criando novo arquivo.');
      }

      if (!Array.isArray(appsData.applicationIds)) {
        appsData.applicationIds = [];
      }

      if (remover) {
        if (!appsData.applicationIds.includes(appId)) {
          return interaction.editReply({
            content: '⚠️ | Esta aplicação **não** está sendo monitorada.'
          });
        }

        appsData.applicationIds = appsData.applicationIds.filter(id => id !== appId);
        await fs.writeFile(appsFile, JSON.stringify(appsData, null, 2));
        return interaction.editReply(`✅️ | Aplicação \`${appId}\` **removida** do monitoramento.`);
      } else {
        if (appsData.applicationIds.includes(appId)) {
          return interaction.editReply({
            content: '⚠️ | Esta aplicação **já** está sendo monitorada.'
          });
        }

        appsData.applicationIds.push(appId);
        await fs.writeFile(appsFile, JSON.stringify(appsData, null, 2));
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
