<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getHero, updateHero, type HeroData } from '../../services/api'

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const form = ref<HeroData>({ name: '', lastName: '', role: '', tagline: '', bio: '' })

onMounted(async () => {
  try {
    form.value = await getHero()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load'
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  error.value = ''
  success.value = false
  try {
    await updateHero(form.value)
    success.value = true
    setTimeout(() => (success.value = false), 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Save failed'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-8 max-w-[720px]">
    <div class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-dim mb-2">Portfolio Admin</p>
      <h1 class="text-[2rem] font-light text-fg -tracking-wide">Hero / Bio</h1>
      <p class="text-sm text-fg2 mt-1">Edit the headline information shown on the home page.</p>
    </div>

    <div v-if="loading" class="text-dim font-mono text-sm animate-pulse">Loading…</div>

    <form v-else class="grid gap-5" @submit.prevent="save">
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="grid gap-1.5">
          <label class="text-[11px] uppercase tracking-[0.18em] text-dim">First Name</label>
          <input v-model="form.name" type="text" required
            class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
        </div>
        <div class="grid gap-1.5">
          <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Last Name</label>
          <input v-model="form.lastName" type="text" required
            class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
        </div>
      </div>

      <div class="grid gap-1.5">
        <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Role / Title</label>
        <input v-model="form.role" type="text" required
          class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
      </div>

      <div class="grid gap-1.5">
        <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Tagline <span class="normal-case text-dim/60">(displayed next to role, smaller)</span></label>
        <input v-model="form.tagline" type="text" placeholder="Web platforms, real-time apps & developer tools"
          class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
      </div>

      <div class="grid gap-1.5">
        <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Bio <span class="normal-case text-dim/60">(HTML allowed)</span></label>
        <textarea v-model="form.bio" rows="4" required
          class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-blue/60 transition-colors resize-y font-mono" />
      </div>

      <div class="flex items-center gap-4">
        <button type="submit" :disabled="saving"
          class="bg-blue text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-60 transition-opacity">
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
        <span v-if="success" class="text-sm text-blue">Saved successfully.</span>
        <span v-if="error" class="text-sm text-error">{{ error }}</span>
      </div>
    </form>
  </div>
</template>
