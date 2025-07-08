import { ActivityType } from 'discord.js';
import axios from 'axios';
import { readFile } from 'fs/promises';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    // 🤖 Lê config.json dinamicamente
    const raw = await readFile('./config.json', 'utf-8');
    const config = JSON.parse(raw);

    // 🤖 Define o status do bot
    client.user.setPresence({
      activities: [{
        name: 'discord.gg/codexlabs',
        type: ActivityType.Watching
      }],
      status: 'idle'
    });

    // 🔧 Função que define a bio e o custom status
    const setBioAndStatus = async () => {
      try {
        await axios.patch('https://discord.com/api/v10/applications/@me', {
          description: "`🚀`  | CodeX Labs\n**Inovação em cada linha, resultado em cada entrega.**\n-> https://discord.gg/codexlabs\n-> https://codexlabs.squareweb.app",
          custom_status: {
            text: "💻 | Developed by CodeX Labs"
          }
        }, {
          headers: {
            Authorization: `Bot ${config.discordToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error("🚫 | Erro ao atualizar bio/status:", err.response?.data || err);
      }
    };

    // 🔧 Aplica imediatamente
    setBioAndStatus();

    // 🔄 Mantém fixo reaplicando a cada 5 minutos (caso o Discord resete)
    setInterval(setBioAndStatus, 5 * 60 * 1000);
  }
};
