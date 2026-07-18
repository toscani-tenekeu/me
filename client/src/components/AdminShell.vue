<script setup lang="ts">
import { useRouter, RouterLink, RouterView } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { logout } = useAuth()

async function handleLogout() {
  await logout()
  router.replace('/admin/login')
}
</script>

<template>
  <div class="min-h-screen flex bg-bg text-fg">
    <!-- Sidebar -->
    <aside class="w-[220px] flex-shrink-0 border-r border-border bg-card flex flex-col">
      <div class="p-5 border-b border-border">
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-dim mb-1">Portfolio</p>
        <p class="text-sm font-medium text-fg">Admin Panel</p>
      </div>

      <nav class="flex-1 p-3 space-y-0.5">
        <RouterLink
          to="/admin/hero"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-fg2 hover:bg-border/40 hover:text-fg transition-colors no-underline"
          active-class="bg-blue/10 !text-blue font-medium"
        >
          Hero / Bio
        </RouterLink>
        <RouterLink
          to="/admin/contact"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-fg2 hover:bg-border/40 hover:text-fg transition-colors no-underline"
          active-class="bg-blue/10 !text-blue font-medium"
        >
          Contact
        </RouterLink>
        <RouterLink
          to="/admin/skills"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-fg2 hover:bg-border/40 hover:text-fg transition-colors no-underline"
          active-class="bg-blue/10 !text-blue font-medium"
        >
          Skills
        </RouterLink>
        <RouterLink
          to="/admin/projects"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-fg2 hover:bg-border/40 hover:text-fg transition-colors no-underline"
          active-class="bg-blue/10 !text-blue font-medium"
        >
          Projects
        </RouterLink>
        <RouterLink
          to="/admin/certs"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-fg2 hover:bg-border/40 hover:text-fg transition-colors no-underline"
          active-class="bg-blue/10 !text-blue font-medium"
        >
          Certificates
        </RouterLink>
      </nav>

      <div class="p-3 border-t border-border space-y-1">
        <RouterLink
          to="/"
          class="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-dim hover:text-fg transition-colors no-underline"
        >
          ← Back to portfolio
        </RouterLink>
        <button
          @click="handleLogout"
          class="w-full text-left px-3 py-2 rounded-md text-xs text-dim hover:text-error transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto min-w-0">
      <RouterView />
    </main>
  </div>
</template>
