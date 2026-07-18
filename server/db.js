import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, '_portfolio.db'))
const CONTENT_VERSION = '4'

db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS hero (id INTEGER PRIMARY KEY CHECK(id=1), name TEXT NOT NULL, last_name TEXT NOT NULL, role TEXT NOT NULL, tagline TEXT NOT NULL, bio TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS contact (id INTEGER PRIMARY KEY CHECK(id=1), email TEXT DEFAULT '', github TEXT DEFAULT '', linkedin TEXT DEFAULT '', whatsapp TEXT DEFAULT '', youtube_en TEXT DEFAULT '', youtube_fr TEXT DEFAULT '');
  CREATE TABLE IF NOT EXISTS skill_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, icon_svg TEXT DEFAULT '', sort_order INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS skills (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INTEGER NOT NULL REFERENCES skill_groups(id) ON DELETE CASCADE, label TEXT NOT NULL, featured INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, sort_order INTEGER DEFAULT 0, title TEXT NOT NULL, slug TEXT NOT NULL, description TEXT DEFAULT '', visibility TEXT DEFAULT 'public', tags TEXT DEFAULT '[]', github_url TEXT DEFAULT '', live_url TEXT DEFAULT '', image TEXT DEFAULT '', tag_icons TEXT DEFAULT '{}');
  CREATE TABLE IF NOT EXISTS cert_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, layout TEXT DEFAULT 'cards', sort_order INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS certs (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INTEGER NOT NULL REFERENCES cert_groups(id) ON DELETE CASCADE, icon TEXT DEFAULT 'certificate', title TEXT NOT NULL, org TEXT DEFAULT '', year TEXT DEFAULT '', badge TEXT DEFAULT 'Certification', image TEXT DEFAULT '', sort_order INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`)

const hero = [
  'Toscani', 'TENEKEU MODJOU', 'Founder of KmerHosting & Full-Stack Developer',
  'Web platforms, real-time apps & developer tools',
  'I build reliable products from interface to infrastructure, with a focus on <strong>Vue, React, Node.js, Django and modern deployment workflows</strong>.',
]
const contact = [
  'hello@toscani.tenekeu.com', 'https://github.com/toscani-tenekeu',
  'https://linkedin.com/in/toscani-tenekeu', '',
  'https://www.youtube.com/@toscani_tenekeu_en', 'https://www.youtube.com/@toscani_tenekeu_fr',
]
const groups = [
  ['front-end', ['Vue.js', 'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Fluent UI', 'Pinia', 'Monaco Editor'], 4],
  ['back-end & APIs', ['Node.js', 'Express.js', 'Django', 'Django REST Framework', 'PHP', 'REST API Design', 'WebSockets', 'WebRTC', 'OpenAPI', 'OpenAI API'], 4],
  ['databases & storage', ['MongoDB / Mongoose', 'MySQL / PDO', 'PostgreSQL / Prisma', 'SQLite / better-sqlite3', 'Redis', 'Cassandra'], 4],
  ['cloud & devops', ['Linux', 'Nginx', 'Docker', 'GitHub Actions', 'PM2', "Certbot / Let's Encrypt", 'SSH', 'Bash scripting'], 4],
  ['testing & security', ['Playwright', 'Vitest', 'Supertest', 'RBAC', 'CSRF protection', 'Session authentication', 'Zod validation', 'Postman'], 3],
  ['languages', ['JavaScript / TypeScript', 'Python', 'PHP', 'SQL', 'Bash', 'HTML / CSS'], 4],
  ['tools & workflow', ['Git / GitHub', 'Vite', 'npm', 'VS Code', 'Linux CLI', 'CI/CD pipelines'], 2],
]
const projects = [
  ['KmerHosting', 'kmerhosting', 'Web hosting and cloud platform built for African customers, with hosting services, domains, account management and developer tooling. The production source code is private.', 'private', ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Docker', 'Nginx'], '', 'https://kmerhosting.com'],
  ['Fullstack Hosting Platform Starter — MEVN Stack', 'fullstack-hosting-platform-starter-mevn-stack', 'Production-oriented starter with Vue 3, Vite, TypeScript, Pinia and Tailwind on the front end, plus Express 5, MongoDB, Mongoose, Zod, Clerk and OpenAPI on the back end. Includes Vitest, Supertest and Playwright.', 'public', ['Vue.js', 'TypeScript', 'Express.js', 'MongoDB', 'Clerk', 'OpenAPI', 'Playwright'], 'https://github.com/toscani-tenekeu/Fullstack_Hosting_Plateform_Starter_MEVN_Stack', ''],
  ['Realtime ChatApp — Django & React', 'realtime-chatapp-django-reactjs-sqlite3', 'Real-time direct and group messaging with replies, reactions, forwarding, voice messages, WebSocket updates and WebRTC calls. Built with React 19, Fluent UI, Django REST Framework, Channels and SQLite.', 'public', ['React', 'Django', 'DRF', 'WebSockets', 'WebRTC', 'SQLite', 'Playwright'], 'https://github.com/toscani-tenekeu/Realtime_ChatApp_Django_ReactJS_SQLite3', ''],
  ['Chat Application — Django, Redis & Cassandra', 'chat-application-django-redis-cassandra', 'Responsive private and group chat application with real-time messaging, presence and theme support. Django Channels and Daphne handle live connections, Redis handles channel messaging, and Cassandra stores chat data.', 'public', ['Django', 'Channels', 'Daphne', 'Redis', 'Cassandra', 'WebSockets'], 'https://github.com/toscani-tenekeu/ChatApplication_Django_Redis_Cassandra', ''],
  ['Inventory Management System', 'inventory-management-system-php-mysql', 'Secure inventory and stock management application built with PHP 8.2 and MySQL. It uses PDO, role-based access control, CSRF protection, sessions and database transactions to enforce stock rules.', 'public', ['PHP', 'MySQL', 'PDO', 'RBAC', 'CSRF', 'Nginx'], 'https://github.com/toscani-tenekeu/Inventory_Management_System_PHP_MySQL', ''],
  ['KmerHosting Developer Tools', 'kmerhosting-developer-tools', 'Open-source TypeScript SDK and command-line tooling for integrating with the KmerHosting API and automating common platform operations from Node.js projects or a terminal.', 'public', ['TypeScript', 'Node.js', 'SDK', 'CLI', 'REST API'], 'https://github.com/KmerHosting/kmerhosting_sdk', 'https://kmerhosting.com/docs/developer/overview'],
  ['Shrub — Online Code Editor', 'shrub-online-code-editor', 'Browser-based code editor built with Next.js, React, TypeScript and Monaco Editor. The interface uses Radix UI and Tailwind CSS for an accessible, responsive development experience.', 'public', ['Next.js', 'React', 'TypeScript', 'Monaco Editor', 'Radix UI', 'Tailwind CSS'], 'https://github.com/toscani-tenekeu/Shrub-free-online-code-editor', ''],
  ['Tinyfolio', 'tinyfolio', 'Compact responsive portfolio built with React and TypeScript. It uses TanStack Router and Fluent UI v9, with theme support and reusable interface components.', 'public', ['React', 'TypeScript', 'TanStack Router', 'Fluent UI', 'Vite'], 'https://github.com/toscani-tenekeu/tinyfolio', ''],
  ['Audio Transcriber', 'audio-transcriber', 'Lightweight browser interface that sends an audio file of up to 25 MB to OpenAI speech-to-text and displays the transcript. It runs without a back end and does not persist the API key.', 'public', ['HTML', 'JavaScript', 'OpenAI API', 'Speech-to-text'], 'https://github.com/toscani-tenekeu/Audio-Transcriber', ''],
  ['wFileManager', 'wfilemanager', 'Public repository for a web-based file manager currently in its initial development phase. The implementation and technical documentation are being prepared.', 'public', ['Work in progress', 'File manager'], 'https://github.com/toscani-tenekeu/wFileManager', ''],
  ['Webcpl', 'webcpl', 'Public repository for a web control panel project currently in its initial development phase. The implementation and technical documentation are being prepared.', 'public', ['Work in progress', 'Web control panel'], 'https://github.com/toscani-tenekeu/Webcpl', ''],
]

const currentVersion = db.prepare("SELECT value FROM metadata WHERE key='content_version'").get()?.value
if (currentVersion !== CONTENT_VERSION) {
  const upsertHero = db.prepare('INSERT INTO hero VALUES (1,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,last_name=excluded.last_name,role=excluded.role,tagline=excluded.tagline,bio=excluded.bio')
  const upsertContact = db.prepare('INSERT INTO contact VALUES (1,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,github=excluded.github,linkedin=excluded.linkedin,whatsapp=excluded.whatsapp,youtube_en=excluded.youtube_en,youtube_fr=excluded.youtube_fr')
  const addGroup = db.prepare('INSERT INTO skill_groups(title,sort_order) VALUES (?,?)')
  const addSkill = db.prepare('INSERT INTO skills(group_id,label,featured,sort_order) VALUES (?,?,?,?)')
  const addProject = db.prepare("INSERT INTO projects(sort_order,title,slug,description,visibility,tags,github_url,live_url,image,tag_icons) VALUES (?,?,?,?,?,?,?,?,'','{}')")
  db.transaction(() => {
    upsertHero.run(...hero)
    upsertContact.run(...contact)
    db.prepare('DELETE FROM skill_groups').run()
    groups.forEach(([title, skills, featuredCount], gi) => {
      const gid = addGroup.run(title, gi).lastInsertRowid
      skills.forEach((label, si) => addSkill.run(gid, label, si < featuredCount ? 1 : 0, si))
    })
    db.prepare('DELETE FROM projects').run()
    projects.forEach(([title, slug, description, visibility, tags, github, live], i) => addProject.run(i, title, slug, description, visibility, JSON.stringify(tags), github, live))
    db.prepare("INSERT INTO metadata(key,value) VALUES ('content_version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(CONTENT_VERSION)
  })()
}

if (db.prepare('SELECT COUNT(*) AS count FROM cert_groups').get().count === 0) {
  const addGroup = db.prepare('INSERT INTO cert_groups(title,layout,sort_order) VALUES (?,?,?)')
  const addCert = db.prepare('INSERT INTO certs(group_id,icon,title,org,year,badge,image,sort_order) VALUES (?,?,?,?,?,?,?,?)')
  const certGroups = [
    ['academic', 'rows', [
      ['graduation-cap', '4th Year Computer Engineering (In Progress)', 'École Supérieure Polytechnique de Douala', '2021 — present', 'In Progress', ''],
      ['scroll', 'BTS — Information Systems Management', 'Institut Supérieur Hintel — Mention BIEN', '2019 — 2021', 'Diploma', ''],
      ['award', 'Baccalauréat C — Mathematics & Physics', 'Institut Petou II', '', 'Baccalaureate', ''],
    ]],
    ['cloud & devops', 'cards', [
      ['certificate', 'AWS DevOps Engineer — Professional (Exam Prep)', 'Whizlabs', 'October 2024', 'Certification', '/certs/devops.jpg'],
      ['certificate', 'AWS Fundamentals — Specialization', 'Amazon Web Services', 'September 2024', 'Certification', '/certs/aws_fundamentals.png'],
    ]],
    ['front-end & design', 'cards', [
      ['certificate', 'Meta Front-End Developer — Specialization', 'Meta / Coursera', 'September 2024', 'Certification', '/certs/meta_frontend.jpg'],
      ['certificate', 'Microsoft UX Design — Professional Certificate', 'Microsoft / Coursera', 'August 2024', 'Certification', '/certs/microsoft_ux.jpg'],
    ]],
    ['ai & productivity', 'cards', [
      ['certificate', 'Prompt Engineering for ChatGPT', 'Vanderbilt University / Coursera', '2024', 'Certification', '/certs/prompt_engineering.png'],
    ]],
  ]
  db.transaction(() => certGroups.forEach(([title, layout, items], gi) => {
    const gid = addGroup.run(title, layout, gi).lastInsertRowid
    items.forEach((item, ci) => addCert.run(gid, ...item, ci))
  }))()
}

db.close()
console.log('Portfolio database initialized.')
