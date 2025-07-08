# 🚀 squareRadar v2

![Badge Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)
![Badge Node](https://img.shields.io/badge/Node.js->=18.0.0-brightgreen.svg)
![Badge License](https://img.shields.io/badge/License-CodeX%20Labs%20CUSTOM-red)
![Badge Status](https://img.shields.io/badge/Status-Ativo-success)

---

## 🧐 Sobre

O **squareRadar** é um bot de Discord criado pela **CodeX Labs** com a missão de monitorar aplicações hospedadas na Squarecloud de forma **eficiente, confiável e em tempo real**.

Totalmente gratuito, open-source e construído com arquitetura modular, ele notifica seu servidor Discord sempre que:
- A aplicação reiniciar
- Ficar offline
- Voltar ao ar
- Tiver erros
- For adicionada/removida do monitoramento

⚠️ Agora com **verificação inteligente com múltiplas tentativas**, evitando falsos positivos causados por instabilidades temporárias da SquareCloud!

---

## ⚙️ Funcionalidades

- 📡 **Monitoramento dinâmico** de múltiplas aplicações SquareCloud
- 🛡️ **Dupla verificação inteligente** (com recheck em 3s, 10s e 30s)
- 🔔 Notificações detalhadas por **embed**
- 💾 Exibe **uso de RAM em MB**
- 🛠️ Comando `/monitorar` para adicionar/remover apps
- 📅 Intervalo de verificação customizável (ex: 1min30s)
- 🧠 Armazena status anteriores para evitar alertas repetidos
- 📁 Estrutura modular separada por comandos, eventos e lógica
- 🚫 Sem dependências desnecessárias — usa o **fetch nativo**

---

## 🛠️ Tecnologias

- 🟩 [Node.js 18+](https://nodejs.org/)
- ⚙️ [Discord.js v14](https://discord.js.org/)
- 🔗 API pública da [Squarecloud](https://squarecloud.app)
- 🔍 Fetch nativo (`global.fetch`) — leve e eficiente

---

## 📦 Instalação

```bash
git clone https://github.com/s1ngul4ritydev/squareRadarv2
cd squareRadarv2
npm install
