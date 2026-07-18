# Toscani Tenekeu — Portfolio

Source code for [portfolio.toscani-tenekeu.com](https://portfolio.toscani-tenekeu.com), the portfolio of Toscani TENEKEU MODJOU — founder of KmerHosting and full-stack developer.

## Stack

- Vue 3, TypeScript, Vite and Tailwind CSS
- Express 5, SQLite and `better-sqlite3`

## Verified projects

- [KmerHosting](https://kmerhosting.com)
- [Fullstack Hosting Platform Starter — MEVN Stack](https://github.com/toscani-tenekeu/Fullstack_Hosting_Plateform_Starter_MEVN_Stack)
- [Realtime ChatApp — Django & React](https://github.com/toscani-tenekeu/Realtime_ChatApp_Django_ReactJS_SQLite3)
- [Chat Application — Django, Redis & Cassandra](https://github.com/toscani-tenekeu/ChatApplication_Django_Redis_Cassandra)
- [Inventory Management System](https://github.com/toscani-tenekeu/Inventory_Management_System_PHP_MySQL)
- [KmerHosting Developer Tools](https://github.com/KmerHosting/kmerhosting_sdk)
- [Shrub — Online Code Editor](https://github.com/toscani-tenekeu/Shrub-free-online-code-editor)
- [Tinyfolio](https://github.com/toscani-tenekeu/tinyfolio)
- [Audio Transcriber](https://github.com/toscani-tenekeu/Audio-Transcriber)
- [wFileManager](https://github.com/toscani-tenekeu/wFileManager) — work in progress
- [Webcpl](https://github.com/toscani-tenekeu/Webcpl) — work in progress

## Local development

```bash
npm install
cp server/.env.example server/.env
npm run dev
```

Validation commands: `npm run lint --workspace client`, `npm run build`, and `npm test`.

## Deployment

From the VPS account with working GitHub SSH access:

```bash
sudo install -d -o "$USER" -g "$(id -gn)" /opt/portfolio.toscani-tenekeu.com
git clone git@github.com:toscani-tenekeu/me.git /opt/portfolio.toscani-tenekeu.com

sudo DEPLOY_USER="$USER" \
  bash /opt/portfolio.toscani-tenekeu.com/deploy/vps-deploy.sh --install-timer
```

The script securely prompts for the portfolio administrator password and completes the deployment.

## License

[MIT](LICENSE)
