<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getContact, updateContact, type ContactData } from '../../services/api'

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const form = ref<ContactData>({ email: '', github: '', linkedin: '', whatsapp: '', youtubeEn: '', youtubeFr: '' })

onMounted(async () => {
  try {
    form.value = await getContact()
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
    await updateContact(form.value)
    success.value = true
    setTimeout(() => (success.value = false), 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Save failed'
  } finally {
    saving.value = false
  }
}

const fields: { key: keyof ContactData; label: string; placeholder: string; type?: string }[] = [
  { key: 'email', label: 'Email', placeholder: 'hello@example.com', type: 'email' },
  { key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/...' },
  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
  { key: 'whatsapp', label: 'WhatsApp URL', placeholder: 'https://wa.me/...' },
  { key: 'youtubeEn', label: 'YouTube (English) URL', placeholder: 'https://youtube.com/@...' },
  { key: 'youtubeFr', label: 'YouTube (French) URL', placeholder: 'https://youtube.com/@...' },
]
</script>

<template>
  <div class="p-8 max-w-[720px]">
    <div class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-dim mb-2">Portfolio Admin</p>
      <h1 class="text-[2rem] font-light text-fg -tracking-wide">Contact Links</h1>
      <p class="text-sm text-fg2 mt-1">Update the contact links shown in the home page and footer.</p>
    </div>

    <div v-if="loading" class="text-dim font-mono text-sm animate-pulse">Loading…</div>

    <form v-else class="grid gap-4" @submit.prevent="save">
      <div v-for="f in fields" :key="f.key" class="grid gap-1.5">
        <label class="text-[11px] uppercase tracking-[0.18em] text-dim">{{ f.label }}</label>
        <input v-model="form[f.key]" :type="f.type ?? 'url'" :placeholder="f.placeholder"
          class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
      </div>

      <div class="flex items-center gap-4 mt-2">
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
