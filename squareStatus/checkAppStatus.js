import { EmbedBuilder } from 'discord.js';
import { appState } from './stateStore.js';
import { log } from '../squareUtils/logger.js';

const baseURL = 'https://api.squarecloud.app/v2/apps';

async function getAppData(appId, token) {
  try {
    const res = await fetch(`${baseURL}/${appId}`, {
      headers: { Authorization: token }
    });

    if (!res.ok) throw new Error(`🚫 | Erro HTTP ${res.status}`);
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

async function recheckStatus(appId, token) {
  const delays = [3000, 10000, 30000]; // 3s, 10s, 30s
  for (const delay of delays) {
    await new Promise(res => setTimeout(res, delay));
    const result = await getAppData(appId, token);
    if (result) return result;
  }
  return null;
}

export async function checkStatus(config, client) {
  for (const appId of config.applicationIds) {
    const data = await getAppData(appId, config.squarecloudToken);

    if (!data) {
      const retry = await recheckStatus(appId, config.squarecloudToken);
      if (!retry) {
        log(`❌ | Falha ao acessar dados da aplicação ${appId} após rechecks`);
        continue;
      }
    }

    const app = data || retry;
    const status = app?.status;
    const ramMB = (app?.ram?.used / 1024).toFixed(2);
    const currentState = appState[appId];

    if (status !== currentState) {
      appState[appId] = status;

      const embed = new EmbedBuilder()
        .setTitle(`📡 ${app.name} - Status Atualizado`)
        .setDescription(`A aplicação **${app.name}** teve o status alterado.`)
        .addFields(
          { name: '🧠 Status', value: `\`${status.toUpperCase()}\`` },
          { name: '💾 RAM Usada', value: `${ramMB} MB`, inline: true },
          { name: '🔗 Painel', value: `[Abrir Dashboard](https://squarecloud.app/dashboard/app/${appId})` }
        )
        .setColor(status === 'online' ? 0x57F287 : 0xED4245)
        .setTimestamp();

      const channel = client.channels.cache.get(config.channelId);
      if (channel) await channel.send({ embeds: [embed] });

      log(`[${app.name}] 🔁 Status: ${status} | RAM: ${ramMB}MB`);
    }
  }
}
