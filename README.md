# Toscani Tenekeu — Portfolio

Source code for [portfolio.toscani-tenekeu.com](https://portfolio.toscani-tenekeu.com), the portfolio of Toscani TENEKEU MODJOU — founder of KmerHosting and full-stack developer.

## Stack

- Vue 3, TypeScript, Vite and Tailwind CSS
- Express 5, persistent SQLite sessions and `better-sqlite3`
- systemd, Nginx and Let's Encrypt in production

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

## VPS deployment

The deployment uses `/opt/portfolio.toscani-tenekeu.com`, port `1245`, the Nginx site `/etc/nginx/sites-available/portfolio.toscani-tenekeu.com` and a systemd timer that checks `master` every two minutes.

```bash
sudo install -d -o "$USER" -g "$(id -gn)" /opt/portfolio.toscani-tenekeu.com
git clone git@github.com:toscani-tenekeu/me.git /opt/portfolio.toscani-tenekeu.com

sudo DEPLOY_USER="$USER" ADMIN_PASS='choose-a-strong-password' \
  bash /opt/portfolio.toscani-tenekeu.com/deploy/vps-deploy.sh --install-timer
```

Node.js, npm, Git, Nginx and Certbot must already be installed. The script does not install software. It builds the application, initializes SQLite, starts the application service, configures Nginx, verifies that DNS resolves to `84.247.132.49`, obtains the certificate and enables automatic updates.

```bash
systemctl status portfolio.toscani-tenekeu.com.service
systemctl status portfolio-auto-deploy.timer
journalctl -u portfolio-auto-deploy.service -n 100 --no-pager
```

## License

[MIT](LICENSE)
