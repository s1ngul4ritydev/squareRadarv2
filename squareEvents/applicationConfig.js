import fs from 'fs/promises';
import path from 'path';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const [action, appId] = interaction.customId.split('_');
    const validActions = ['start', 'stop', 'restart'];
    if (!validActions.includes(action)) return;

    await interaction.deferReply({ ephemeral: true });

    // 🔧 Carrega o token do config.json
    let config;
    try {
      const raw = await fs.readFile(path.resolve('config.json'), 'utf-8');
      config = JSON.parse(raw);
    } catch (err) {
      console.error('❌ | Erro ao ler config.json:', err);
      return interaction.editReply('❌ | Erro interno: não foi possível acessar o token da SquareCloud.');
    }

    const endpoint = `https://api.squarecloud.app/v2/apps/${appId}/${action}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: config.squarecloudToken,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        return interaction.editReply(`❌ | Erro ao executar ação: ${json.message || 'Erro desconhecido.'}`);
      }

      return interaction.editReply(`✅ | Ação **${action.toUpperCase()}** executada com sucesso na aplicação \`${appId}\`!`);
    } catch (err) {
      console.error('❌ | Erro ao fazer requisição à SquareCloud:', err);
      return interaction.editReply('❌ | Falha ao comunicar com a API da SquareCloud.');
    }
  },
};
