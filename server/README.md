# Portfolio server

The Express server provides the public portfolio API, authenticated admin API and production Vue build. SQLite is initialized automatically by `start.js`.

Copy `.env.example` to `.env`, replace the placeholders, then run `npm run build && npm start` from the repository root. The server binds to `127.0.0.1:1245`; `GET /health` is available for systemd and Nginx checks.
