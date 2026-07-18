<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const user = ref('')
const pass = ref('')
const loading = ref(false)
const error = ref('')
const checking = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/admin/me', { credentials: 'include' })
    const data = await res.json()
    if (data.authenticated) router.replace('/admin')
  } finally {
    checking.value = false
  }
})

async function submit() {
  if (!user.value || !pass.value) return
  loading.value = true
  error.value = ''
  try {
    await login(user.value, pass.value)
    router.replace('/admin')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg flex items-center justify-center px-6">
    <div v-if="checking" class="text-dim font-mono text-sm animate-pulse">Checking session…</div>

    <div v-else class="w-full max-w-[440px]">
      <div class="border border-border rounded-2xl bg-card p-8">
        <div class="mb-6">
          <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-dim mb-2">Private access</p>
          <h1 class="text-[2rem] font-light text-fg -tracking-wide leading-tight">Admin sign in</h1>
        </div>

        <form class="grid gap-4" @submit.prevent="submit">
          <div class="grid gap-1.5">
            <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Username</label>
            <input
              v-model="user"
              type="text"
              autocomplete="username"
              placeholder="Authorized people only"
              required
              class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-blue/60 transition-colors"
            />
          </div>
          <div class="grid gap-1.5">
            <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Password</label>
            <input
              v-model="pass"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              required
              class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-blue/60 transition-colors"
            />
          </div>

          <p v-if="error" class="text-sm text-error">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="cursor-pointer inline-flex items-center text-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-blue bg-blue text-white hover:opacity-90 transition-opacity no-underline"
          >
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="mt-6 text-center">
          <RouterLink to="/" class="text-xs text-dim hover:text-fg transition-colors no-underline">
            ← Back to portfolio
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
