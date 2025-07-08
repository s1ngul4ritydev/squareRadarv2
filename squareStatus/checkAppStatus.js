import { EmbedBuilder } from 'discord.js';
import { appState } from './stateStore.js';
import { log } from '../squareUtils/logger.js';
import fs from 'fs/promises';

const baseURL = 'https://api.squarecloud.app/v2/apps';

// 🔍 Busca dados da aplicação
async function getAppData(appId, token) {
  try {
    const res = await fetch(`${baseURL}/${appId}`, {
      headers: { Authorization: token }
    });

    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

// ♻️ Recheca com intervalos (3s, 10s, 30s)
async function recheckStatus(appId, token) {
  const delays = [3000, 10000, 30000];
  for (const delay of delays) {
    await new Promise(r => setTimeout(r, delay));
    const result = await getAppData(appId, token);
    if (result) return result;
  }
  return null;
}

// ✅ Função principal
export async function checkStatus(config, client) {
  let appsRaw;
  try {
    appsRaw = await fs.readFile('./squareData/apps.json', 'utf-8');
  } catch (err) {
    log('❌ | Não foi possível ler o arquivo squareData/apps.json');
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(appsRaw);
  } catch {
    log('❌ | apps.json está mal formatado. Esperado: { "applicationIds": [] }');
    return;
  }

  const apps = parsed.applicationIds;
  if (!Array.isArray(apps)) {
    log('❌ | O campo "applicationIds" está ausente ou inválido em apps.json');
    return;
  }

  for (const appId of apps) {
    const data = await getAppData(appId, config.squarecloudToken);

    let app = data;
    if (!data) {
      const retry = await recheckStatus(appId, config.squarecloudToken);
      if (!retry) {
        log(`❌ | Falha ao acessar dados da aplicação ${appId} após rechecks`);
        continue;
      }
      app = retry;
    }

    const status = app.status;
    const ramMB = (app?.ram?.used / 1024).toFixed(2);
    const currentState = appState[appId];

    if (status !== currentState) {
      appState[appId] = status;

      const embed = new EmbedBuilder()
        .setTitle(`📡 ${app.name} - Status Atualizado`)
        .setDescription(`A aplicação **${app.name}** teve o status alterado.`)
        .addFields(
          { name: '🧠 Status', value: `\`${status.toUpperCase()}\``, inline: true },
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
