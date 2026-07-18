import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Toscani TENEKEU MODJOU — Founder of KmerHosting & Full-Stack Developer',
        description: 'Portfolio of Toscani Tenekeu: web platforms, real-time applications and developer tools.',
      },
    },
    {
      path: '/skills',
      name: 'skills',
      component: () => import('../views/SkillsView.vue'),
      meta: {
        title: 'Skills — Toscani TENEKEU MODJOU',
        description: 'Verified full-stack, database, DevOps, testing and security skills.',
      },
    },
    {
      path: '/works',
      name: 'works',
      component: () => import('../views/WorksView.vue'),
      meta: {
        title: 'Projects — Toscani TENEKEU MODJOU',
        description: 'Selected projects by Toscani TENEKEU MODJOU.',
      },
    },
    {
      path: '/works/:slug',
      name: 'work-detail',
      component: () => import('../views/WorkDetailView.vue'),
      meta: { title: 'Project — Toscani TENEKEU MODJOU' },
    },
    {
      path: '/certs',
      name: 'certs',
      component: () => import('../views/CertsView.vue'),
      meta: {
        title: 'Certificates — Toscani TENEKEU MODJOU',
        description: 'Degrees and professional certifications.',
      },
    },
    // ── Admin ───────────────────────────────────────────────────────────────
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/AdminLoginView.vue'),
      meta: { title: 'Admin — Sign in' },
    },
    {
      path: '/admin',
      component: () => import('../components/AdminShell.vue'),
      meta: { requiresAuth: true, title: 'Admin — Portfolio' },
      redirect: '/admin/hero',
      children: [
        { path: 'hero',     component: () => import('../views/admin/AdminHeroView.vue'),     meta: { title: 'Admin — Hero' } },
        { path: 'contact',  component: () => import('../views/admin/AdminContactView.vue'),  meta: { title: 'Admin — Contact' } },
        { path: 'skills',   component: () => import('../views/admin/AdminSkillsView.vue'),   meta: { title: 'Admin — Skills' } },
        { path: 'projects', component: () => import('../views/admin/AdminProjectsView.vue'), meta: { title: 'Admin — Projects' } },
        { path: 'certs',    component: () => import('../views/admin/AdminCertsView.vue'),    meta: { title: 'Admin — Certs' } },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// ── Auth guard ───────────────────────────────────────────────────────────────
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    try {
      const res = await fetch('/api/admin/me', { credentials: 'include' })
      const data = await res.json()
      if (!data.authenticated) return '/admin/login'
    } catch {
      return '/admin/login'
    }
  }
})

router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  const desc  = to.meta?.description as string | undefined
  if (title) document.title = title
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc && desc) metaDesc.setAttribute('content', desc)
})

export default router
