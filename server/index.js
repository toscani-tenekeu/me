import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import crypto from 'node:crypto'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const dbPath = path.resolve(__dirname, './_portfolio.db')
const distDir = path.join(rootDir, 'client', 'dist')

const isProduction = process.env.NODE_ENV === 'production'
const PORT = Number.parseInt(process.env.PORTFOLIO_PORT ?? '1245', 10)
const HOST = process.env.PORTFOLIO_HOST ?? '127.0.0.1'
const configuredSessionSecret = process.env.SESSION_SECRET
const SESSION_SECRET = configuredSessionSecret ?? 'development-only-session-secret-change-me'
const ADMIN_USER = process.env.ADMIN_USER
const ADMIN_PASS = process.env.ADMIN_PASS

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('PORTFOLIO_PORT must be between 1 and 65535.')
if (isProduction && (!configuredSessionSecret || configuredSessionSecret.length < 32)) throw new Error('SESSION_SECRET must contain at least 32 characters in production.')

if (!ADMIN_USER || !ADMIN_PASS) {
  console.warn('[portfolio] WARNING: ADMIN_USER / ADMIN_PASS not set in .env — admin login is disabled.')
}

const app = express()
const db = new Database(dbPath)
db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')

class SQLiteSessionStore extends session.Store {
  constructor(database) {
    super()
    this.database = database
    database.exec('CREATE TABLE IF NOT EXISTS admin_sessions (sid TEXT PRIMARY KEY, data TEXT NOT NULL, expires_at INTEGER NOT NULL)')
    this.read = database.prepare('SELECT data, expires_at FROM admin_sessions WHERE sid=?')
    this.write = database.prepare('INSERT INTO admin_sessions(sid,data,expires_at) VALUES (?,?,?) ON CONFLICT(sid) DO UPDATE SET data=excluded.data,expires_at=excluded.expires_at')
    this.remove = database.prepare('DELETE FROM admin_sessions WHERE sid=?')
    this.removeExpired = database.prepare('DELETE FROM admin_sessions WHERE expires_at<=?')
    this.pruneTimer = setInterval(() => this.removeExpired.run(Date.now()), 30 * 60 * 1000)
    this.pruneTimer.unref()
    this.removeExpired.run(Date.now())
  }
  get(sid, callback) {
    try {
      const row = this.read.get(sid)
      if (!row || row.expires_at <= Date.now()) {
        if (row) this.remove.run(sid)
        return callback(null, null)
      }
      callback(null, JSON.parse(row.data))
    } catch (error) { callback(error) }
  }
  set(sid, value, callback = () => {}) {
    try {
      const expiresAt = value.cookie?.expires ? new Date(value.cookie.expires).getTime() : Date.now() + 12 * 60 * 60 * 1000
      this.write.run(sid, JSON.stringify(value), expiresAt)
      callback(null)
    } catch (error) { callback(error) }
  }
  destroy(sid, callback = () => {}) {
    try { this.remove.run(sid); callback(null) } catch (error) { callback(error) }
  }
  touch(sid, value, callback = () => {}) { this.set(sid, value, callback) }
  close() { clearInterval(this.pruneTimer) }
}

const sessionStore = new SQLiteSessionStore(db)
if (isProduction) app.set('trust proxy', 1)

function toSlug(str) {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// Migration: add tagline column if missing (existing deployments)
const heroColumns = db.pragma('table_info(hero)').map(c => c.name)
if (!heroColumns.includes('tagline')) {
  db.exec("ALTER TABLE hero ADD COLUMN tagline TEXT NOT NULL DEFAULT 'Web platforms, real-time apps & developer tools'")
}

// Migration: slug + image on projects
const projCols = db.pragma('table_info(projects)').map(c => c.name)
if (!projCols.includes('slug')) {
  db.exec(`ALTER TABLE projects ADD COLUMN slug TEXT NOT NULL DEFAULT ''`)
  const rows = db.prepare('SELECT id, title FROM projects').all()
  const upd = db.prepare('UPDATE projects SET slug = ? WHERE id = ?')
  rows.forEach(r => upd.run(toSlug(r.title), r.id))
}
if (!projCols.includes('image')) {
  db.exec(`ALTER TABLE projects ADD COLUMN image TEXT DEFAULT ''`)
}
if (!projCols.includes('tag_icons')) {
  db.exec(`ALTER TABLE projects ADD COLUMN tag_icons TEXT DEFAULT '{}'`)
}

// Migration: icon_svg on skill_groups
const sgCols = db.pragma('table_info(skill_groups)').map(c => c.name)
if (!sgCols.includes('icon_svg')) {
  db.exec(`ALTER TABLE skill_groups ADD COLUMN icon_svg TEXT DEFAULT ''`)
}

app.disable('x-powered-by')
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  })
  next()
})
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    name: 'portfolio.sid',
    store: sessionStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: 'lax', httpOnly: true, secure: isProduction, maxAge: 12 * 60 * 60 * 1000 },
  }),
)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── Helpers ──────────────────────────────────────────────────────────────────

function isAdmin(req) {
  return Boolean(req.session?.admin?.authenticated)
}

function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ message: 'Unauthorized' })
  next()
}

/** Timing-safe string comparison — prevents timing attacks on credentials */
function safeEqual(a, b) {
  const aBuf = Buffer.from(String(a ?? ''))
  const bBuf = Buffer.from(String(b ?? ''))
  if (aBuf.length !== bBuf.length) {
    crypto.timingSafeEqual(aBuf, aBuf) // consume time even on mismatch
    return false
  }
  return crypto.timingSafeEqual(aBuf, bBuf)
}

// ── DB helpers (better-sqlite3 is synchronous) ────────────────────────────────
const dbGet = (sql, p = []) => db.prepare(sql).get(p)
const dbAll = (sql, p = []) => db.prepare(sql).all(p)
const dbRun = (sql, p = []) => db.prepare(sql).run(p)

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || '')
  } catch {
    return fallback
  }
}

function projectPayload(r, num) {
  return {
    id: r.id,
    ...(num ? { num } : {}),
    slug: r.slug || toSlug(r.title),
    title: r.title,
    desc: r.description,
    tags: parseJson(r.tags, []),
    tagIcons: parseJson(r.tag_icons, {}),
    visibility: r.visibility,
    image: r.image || undefined,
    github: r.github_url || undefined,
    live: r.live_url || undefined,
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 5
const loginAttempts = new Map()

function limitAdminLogin(req, res, next) {
  const now = Date.now()
  const current = loginAttempts.get(req.ip)
  if (!current || now - current.startedAt >= LOGIN_WINDOW_MS) {
    loginAttempts.set(req.ip, { count: 0, startedAt: now })
    return next()
  }
  if (current.count >= MAX_LOGIN_ATTEMPTS) {
    res.set('Retry-After', String(Math.ceil((LOGIN_WINDOW_MS - (now - current.startedAt)) / 1000)))
    return res.status(429).json({ message: 'Too many login attempts. Please try again later.' })
  }
  next()
}

app.post('/api/admin/login', limitAdminLogin, (req, res) => {
  const { user, pass } = req.body ?? {}
  if (!ADMIN_USER || !ADMIN_PASS)
    return res.status(500).json({ message: 'Admin credentials not configured in .env' })

  const ok = safeEqual(user, ADMIN_USER) && safeEqual(pass, ADMIN_PASS)
  if (!ok) {
    const attempt = loginAttempts.get(req.ip) ?? { count: 0, startedAt: Date.now() }
    attempt.count += 1
    loginAttempts.set(req.ip, attempt)
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  loginAttempts.delete(req.ip)
  req.session.regenerate((error) => {
    if (error) return res.status(500).json({ message: 'Unable to create admin session' })
    req.session.admin = { authenticated: true }
    req.session.save((saveError) => saveError
      ? res.status(500).json({ message: 'Unable to save admin session' })
      : res.json({ authenticated: true }))
  })
})

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('portfolio.sid')
    res.json({ ok: true })
  })
})

app.get('/api/admin/me', (req, res) => {
  res.json({ authenticated: isAdmin(req) })
})

// ── Public read routes ────────────────────────────────────────────────────────

app.get('/api/hero', (_req, res) => {
  try {
    const row = dbGet('SELECT * FROM hero WHERE id = 1')
    if (!row) return res.status(404).json({ message: 'Not found' })
    res.json({ name: row.name, lastName: row.last_name, role: row.role, tagline: row.tagline ?? '', bio: row.bio })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/contact', (_req, res) => {
  try {
    const row = dbGet('SELECT * FROM contact WHERE id = 1')
    if (!row) return res.status(404).json({ message: 'Not found' })
    res.json({
      email: row.email, github: row.github, linkedin: row.linkedin,
      whatsapp: row.whatsapp, youtubeEn: row.youtube_en, youtubeFr: row.youtube_fr,
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/skills', (_req, res) => {
  try {
    const groups = dbAll('SELECT * FROM skill_groups ORDER BY sort_order, id')
    for (const g of groups) {
      g.skills = dbAll('SELECT * FROM skills WHERE group_id = ? ORDER BY sort_order, id', [g.id])
      for (const s of g.skills) s.featured = Boolean(s.featured)
    }
    res.json(groups)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/projects', (_req, res) => {
  try {
    const rows = dbAll('SELECT * FROM projects ORDER BY sort_order, id')
    res.json(
      rows.map((r, i) => projectPayload(r, String(i + 1).padStart(2, '0'))),
    )
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/projects/:slug', (req, res) => {
  try {
    const r = dbGet('SELECT * FROM projects WHERE slug = ?', [req.params.slug])
    if (!r) return res.status(404).json({ message: 'Not found' })
    res.json(projectPayload(r))
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/certs', (_req, res) => {
  try {
    const groups = dbAll('SELECT * FROM cert_groups ORDER BY sort_order, id')
    for (const g of groups) {
      g.items = dbAll('SELECT * FROM certs WHERE group_id = ? ORDER BY sort_order, id', [g.id])
    }
    res.json(groups)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// ── Admin — Hero ──────────────────────────────────────────────────────────────

app.put('/api/admin/hero', requireAdmin, (req, res) => {
  const { name, lastName, role, tagline, bio } = req.body
  dbRun('UPDATE hero SET name=?, last_name=?, role=?, tagline=?, bio=? WHERE id=1', [name, lastName, role, tagline ?? '', bio])
  res.json({ ok: true })
})

// ── Admin — Contact ───────────────────────────────────────────────────────────

app.put('/api/admin/contact', requireAdmin, (req, res) => {
  const { email, github, linkedin, whatsapp, youtubeEn, youtubeFr } = req.body
  dbRun('UPDATE contact SET email=?, github=?, linkedin=?, whatsapp=?, youtube_en=?, youtube_fr=? WHERE id=1', [email, github, linkedin, whatsapp, youtubeEn, youtubeFr])
  res.json({ ok: true })
})

// ── Admin — Skill groups ──────────────────────────────────────────────────────

app.post('/api/admin/skill-groups', requireAdmin, (req, res) => {
  const { title, sort_order = 0, icon_svg = '' } = req.body
  const r = dbRun('INSERT INTO skill_groups (title, sort_order, icon_svg) VALUES (?, ?, ?)', [title, sort_order, icon_svg])
  res.json({ id: r.lastInsertRowid })
})

app.put('/api/admin/skill-groups/:id', requireAdmin, (req, res) => {
  const { title, sort_order, icon_svg = '' } = req.body
  dbRun('UPDATE skill_groups SET title=?, sort_order=?, icon_svg=? WHERE id=?', [title, sort_order, icon_svg, req.params.id])
  res.json({ ok: true })
})

app.delete('/api/admin/skill-groups/:id', requireAdmin, (req, res) => {
  dbRun('DELETE FROM skill_groups WHERE id=?', [req.params.id])
  res.json({ ok: true })
})

app.post('/api/admin/skill-groups/:gid/skills', requireAdmin, (req, res) => {
  const { label, featured = false, sort_order = 0 } = req.body
  const r = dbRun('INSERT INTO skills (group_id, label, featured, sort_order) VALUES (?, ?, ?, ?)', [req.params.gid, label, featured ? 1 : 0, sort_order])
  res.json({ id: r.lastInsertRowid })
})

app.put('/api/admin/skill-groups/:gid/skills/:id', requireAdmin, (req, res) => {
  const { label, featured, sort_order } = req.body
  dbRun('UPDATE skills SET label=?, featured=?, sort_order=? WHERE id=? AND group_id=?', [label, featured ? 1 : 0, sort_order, req.params.id, req.params.gid])
  res.json({ ok: true })
})

app.delete('/api/admin/skill-groups/:gid/skills/:id', requireAdmin, (req, res) => {
  dbRun('DELETE FROM skills WHERE id=? AND group_id=?', [req.params.id, req.params.gid])
  res.json({ ok: true })
})

// ── Admin — Projects ──────────────────────────────────────────────────────────

app.post('/api/admin/projects', requireAdmin, (req, res) => {
  const { title, description, visibility, tags, tagIcons = {}, github_url, live_url, sort_order = 0, image = '', slug } = req.body
  const finalSlug = slug || toSlug(title)
  const r = dbRun(
    'INSERT INTO projects (title, slug, description, visibility, tags, tag_icons, github_url, live_url, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, finalSlug, description, visibility, JSON.stringify(tags ?? []), JSON.stringify(tagIcons ?? {}), github_url, live_url, image, sort_order],
  )
  res.json({ id: r.lastInsertRowid })
})

app.put('/api/admin/projects/:id', requireAdmin, (req, res) => {
  const { title, description, visibility, tags, tagIcons = {}, github_url, live_url, sort_order, image = '', slug } = req.body
  const finalSlug = slug || toSlug(title)
  dbRun(
    'UPDATE projects SET title=?, slug=?, description=?, visibility=?, tags=?, tag_icons=?, github_url=?, live_url=?, image=?, sort_order=? WHERE id=?',
    [title, finalSlug, description, visibility, JSON.stringify(tags ?? []), JSON.stringify(tagIcons ?? {}), github_url, live_url, image, sort_order, req.params.id],
  )
  res.json({ ok: true })
})

app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
  dbRun('DELETE FROM projects WHERE id=?', [req.params.id])
  res.json({ ok: true })
})

// ── Admin — Cert groups ───────────────────────────────────────────────────────

app.post('/api/admin/cert-groups', requireAdmin, (req, res) => {
  const { title, layout = 'cards', sort_order = 0 } = req.body
  const r = dbRun('INSERT INTO cert_groups (title, layout, sort_order) VALUES (?, ?, ?)', [title, layout, sort_order])
  res.json({ id: r.lastInsertRowid })
})

app.put('/api/admin/cert-groups/:id', requireAdmin, (req, res) => {
  const { title, layout, sort_order } = req.body
  dbRun('UPDATE cert_groups SET title=?, layout=?, sort_order=? WHERE id=?', [title, layout, sort_order, req.params.id])
  res.json({ ok: true })
})

app.delete('/api/admin/cert-groups/:id', requireAdmin, (req, res) => {
  dbRun('DELETE FROM cert_groups WHERE id=?', [req.params.id])
  res.json({ ok: true })
})

app.post('/api/admin/cert-groups/:gid/certs', requireAdmin, (req, res) => {
  const { icon, title, org, year, badge, image, sort_order = 0 } = req.body
  const r = dbRun('INSERT INTO certs (group_id, icon, title, org, year, badge, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.params.gid, icon, title, org, year, badge, image, sort_order])
  res.json({ id: r.lastInsertRowid })
})

app.put('/api/admin/cert-groups/:gid/certs/:id', requireAdmin, (req, res) => {
  const { icon, title, org, year, badge, image, sort_order } = req.body
  dbRun('UPDATE certs SET icon=?, title=?, org=?, year=?, badge=?, image=?, sort_order=? WHERE id=? AND group_id=?', [icon, title, org, year, badge, image, sort_order, req.params.id, req.params.gid])
  res.json({ ok: true })
})

app.delete('/api/admin/cert-groups/:gid/certs/:id', requireAdmin, (req, res) => {
  dbRun('DELETE FROM certs WHERE id=? AND group_id=?', [req.params.id, req.params.gid])
  res.json({ ok: true })
})

// ── Serve Vite build in production ────────────────────────────────────────────

app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }))

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || !req.accepts('html')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
} else {
  console.warn(`[portfolio] Client build not found at ${distDir}. Run npm run build.`)
}

app.use((_req, res) => res.status(404).json({ message: 'Not found' }))
app.use((error, _req, res, _next) => {
  console.error('[portfolio] Unhandled request error:', error)
  if (!res.headersSent) res.status(500).json({ message: 'Server error' })
})

const server = app.listen(PORT, HOST, () => {
  console.log(`Portfolio server → http://${HOST}:${PORT}`)
})

function shutdown(signal) {
  console.log(`[portfolio] ${signal} received; shutting down.`)
  server.close(() => {
    sessionStore.close()
    db.close()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.once('SIGTERM', () => shutdown('SIGTERM'))
process.once('SIGINT', () => shutdown('SIGINT'))
