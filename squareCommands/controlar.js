import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('controlar')
    .setDescription('🔧 | Controle uma aplicação da SquareCloud utilizando um painel.')
    .addStringOption(opt =>
      opt.setName('app_id')
        .setDescription('ID da aplicação da SquareCloud')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const appId = interaction.options.getString('app_id');

    if (!appId || appId.length < 10) {
      return interaction.editReply({
        content: '❌ | O ID fornecido é inválido. Verifique se copiou corretamente do painel da SquareCloud.',
      });
    }

    // 🔧 Embed de controle
    const embed = new EmbedBuilder()
      .setTitle('🎛️ Controle da Aplicação')
      .setDescription(`Use os botões abaixo para gerenciar a aplicação:\n\`\`\`${appId}\`\`\``)
      .setColor(0x5865F2)
      .setFooter({ text: 'CodeX Labs • squareRadar' })
      .setTimestamp();

    // 🎮 Botões
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`start_${appId}`)
        .setLabel('Iniciar')
        .setEmoji('<:Bot_Ready_Shadow:1353465375072846025>')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`stop_${appId}`)
        .setLabel('Parar')
        .setEmoji('<:CodeX_Bot_Stop:1392254726044647534>')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`restart_${appId}`)
        .setLabel('Reiniciar')
        .setEmoji('<:Bot_Restart_Shadow:1353466068294963302>')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setLabel('GitHub')
        .setEmoji('<:CodeX_GitHub_Discover:1392262392569921667>')
        .setStyle(ButtonStyle.Link)
        .setURL('https://github.com/s1ngul4ritydev/squareRadarv2')
    );

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  },
};
