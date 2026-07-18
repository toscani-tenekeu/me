// Portfolio API client

export interface HeroData {
  name: string
  lastName: string
  role: string
  tagline: string
  bio: string
}

export interface ContactData {
  email: string
  github: string
  linkedin: string
  whatsapp: string
  youtubeEn: string
  youtubeFr: string
}

export interface SkillItem {
  id: number
  label: string
  featured: boolean
  sort_order: number
}

export interface SkillGroupData {
  id: number
  title: string
  icon_svg?: string
  sort_order: number
  skills: SkillItem[]
}

export interface ProjectData {
  id: number
  num: string
  slug: string
  title: string
  desc: string
  tags: string[]
  tagIcons?: Record<string, string>
  visibility: 'public' | 'private'
  image?: string
  github?: string
  live?: string
}

export interface CertData {
  id: number
  icon: string
  title: string
  org: string
  year?: string
  badge: 'In Progress' | 'Diploma' | 'Baccalaureate' | 'Certification'
  image?: string
  sort_order: number
}

export interface CertGroupData {
  id: number
  title: string
  layout: 'rows' | 'cards'
  sort_order: number
  items: CertData[]
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json() : await res.text()
  if (!res.ok) {
    const message = typeof payload === 'string' ? payload : (payload as { message?: string })?.message ?? 'Request failed'
    throw new Error(message)
  }
  return payload as T
}

// ── Public ───────────────────────────────────────────────────────────────────
export const getHero = () => request<HeroData>('/api/hero')
export const getContact = () => request<ContactData>('/api/contact')
export const getSkills = () => request<SkillGroupData[]>('/api/skills')
export const getProjects = () => request<ProjectData[]>('/api/projects')
export const getProject = (slug: string) => request<ProjectData>(`/api/projects/${slug}`)
export const getCerts = () => request<CertGroupData[]>('/api/certs')

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (user: string, pass: string) =>
  request<{ authenticated: boolean }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ user, pass }) })
export const logout = () =>
  request<{ ok: boolean }>('/api/admin/logout', { method: 'POST' })
export const getMe = () =>
  request<{ authenticated: boolean }>('/api/admin/me')

// ── Admin — Hero & Contact ────────────────────────────────────────────────────
export const updateHero = (data: HeroData) =>
  request<{ ok: boolean }>('/api/admin/hero', { method: 'PUT', body: JSON.stringify(data) })
export const updateContact = (data: ContactData) =>
  request<{ ok: boolean }>('/api/admin/contact', { method: 'PUT', body: JSON.stringify(data) })

// ── Admin — Skills ────────────────────────────────────────────────────────────
export const createSkillGroup = (data: { title: string; icon_svg?: string }) =>
  request<{ id: number }>('/api/admin/skill-groups', { method: 'POST', body: JSON.stringify(data) })
export const updateSkillGroup = (id: number, data: { title: string; sort_order: number; icon_svg?: string }) =>
  request<{ ok: boolean }>(`/api/admin/skill-groups/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteSkillGroup = (id: number) =>
  request<{ ok: boolean }>(`/api/admin/skill-groups/${id}`, { method: 'DELETE' })
export const createSkill = (gid: number, data: { label: string; featured: boolean; sort_order?: number }) =>
  request<{ id: number }>(`/api/admin/skill-groups/${gid}/skills`, { method: 'POST', body: JSON.stringify(data) })
export const updateSkill = (gid: number, id: number, data: { label: string; featured: boolean; sort_order: number }) =>
  request<{ ok: boolean }>(`/api/admin/skill-groups/${gid}/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteSkill = (gid: number, id: number) =>
  request<{ ok: boolean }>(`/api/admin/skill-groups/${gid}/skills/${id}`, { method: 'DELETE' })

// ── Admin — Projects ──────────────────────────────────────────────────────────
export const createProject = (data: {
  title: string; description: string; visibility: string
  tags: string[]; tagIcons?: Record<string, string>
  github_url: string; live_url: string
  sort_order?: number; slug?: string; image?: string
}) => request<{ id: number }>('/api/admin/projects', { method: 'POST', body: JSON.stringify(data) })
export const updateProject = (id: number, data: {
  title: string; description: string; visibility: string
  tags: string[]; tagIcons?: Record<string, string>
  github_url: string; live_url: string
  sort_order: number; slug?: string; image?: string
}) => request<{ ok: boolean }>(`/api/admin/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteProject = (id: number) =>
  request<{ ok: boolean }>(`/api/admin/projects/${id}`, { method: 'DELETE' })

// ── Admin — Certs ─────────────────────────────────────────────────────────────
export const createCertGroup = (data: { title: string; layout: string }) =>
  request<{ id: number }>('/api/admin/cert-groups', { method: 'POST', body: JSON.stringify(data) })
export const updateCertGroup = (id: number, data: { title: string; layout: string; sort_order: number }) =>
  request<{ ok: boolean }>(`/api/admin/cert-groups/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCertGroup = (id: number) =>
  request<{ ok: boolean }>(`/api/admin/cert-groups/${id}`, { method: 'DELETE' })
export const createCert = (gid: number, data: { icon: string; title: string; org: string; year: string; badge: string; image: string; sort_order?: number }) =>
  request<{ id: number }>(`/api/admin/cert-groups/${gid}/certs`, { method: 'POST', body: JSON.stringify(data) })
export const updateCert = (gid: number, id: number, data: { icon: string; title: string; org: string; year: string; badge: string; image: string; sort_order: number }) =>
  request<{ ok: boolean }>(`/api/admin/cert-groups/${gid}/certs/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCert = (gid: number, id: number) =>
  request<{ ok: boolean }>(`/api/admin/cert-groups/${gid}/certs/${id}`, { method: 'DELETE' })
