<script setup lang="ts">
import { onMounted, ref, reactive, watch } from 'vue'
import {
  getProjects, createProject, updateProject, deleteProject,
  type ProjectData,
} from '../../services/api'

const loading = ref(true)
const error = ref('')
const projects = ref<ProjectData[]>([])

type ProjectForm = {
  title: string; description: string; visibility: 'public' | 'private'
  tags: string; github_url: string; live_url: string; sort_order: number
  slug: string; image: string; tag_icons: string
}

const emptyForm = (): ProjectForm => ({
  title: '', description: '', visibility: 'public',
  tags: '', github_url: '', live_url: '', sort_order: 0,
  slug: '', image: '', tag_icons: '',
})

function toSlug(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function serializeTagIcons(tagIcons?: Record<string, string>): string {
  return Object.entries(tagIcons ?? {})
    .map(([tag, icon]) => `${tag}=${icon}`)
    .join('\n')
}

function parseTagIcons(input: string): Record<string, string> {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const separator = line.indexOf('=')
      if (separator === -1) return acc
      const tag = line.slice(0, separator).trim()
      const icon = line.slice(separator + 1).trim()
      if (tag && icon) acc[tag] = icon
      return acc
    }, {})
}

const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive<ProjectForm>(emptyForm())

// Auto-generate slug from title when adding new projects
watch(() => form.title, (val) => {
  if (editingId.value === null) {
    form.slug = toSlug(val)
  }
})

async function load() {
  loading.value = true
  try {
    projects.value = await getProjects()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openAdd() {
  Object.assign(form, emptyForm())
  form.sort_order = projects.value.length
  editingId.value = null
  formError.value = ''
  showModal.value = true
}

function openEdit(p: ProjectData) {
  form.title = p.title
  form.description = p.desc
  form.visibility = p.visibility
  form.tags = p.tags.join(', ')
  form.github_url = p.github ?? ''
  form.live_url = p.live ?? ''
  form.sort_order = projects.value.findIndex((x) => x.id === p.id)
  form.slug = p.slug ?? ''
  form.image = p.image ?? ''
  form.tag_icons = serializeTagIcons(p.tagIcons)
  editingId.value = p.id
  formError.value = ''
  showModal.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
  const tagIcons = parseTagIcons(form.tag_icons)
  const data = {
    title: form.title,
    slug: form.slug || toSlug(form.title),
    description: form.description,
    visibility: form.visibility,
    tags,
    tagIcons,
    github_url: form.github_url,
    live_url: form.live_url,
    sort_order: form.sort_order,
    image: form.image,
  }
  try {
    if (editingId.value !== null) {
      await updateProject(editingId.value, data)
    } else {
      await createProject(data)
    }
    showModal.value = false
    await load()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Save failed'
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Delete this project?')) return
  await deleteProject(id)
  await load()
}
</script>

<template>
  <div class="p-8 max-w-[1000px]">
    <div class="flex items-start justify-between gap-4 mb-8 flex-wrap">
      <div>
        <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-dim mb-2">Portfolio Admin</p>
        <h1 class="text-[2rem] font-light text-fg -tracking-wide">Projects</h1>
      </div>
      <button @click="openAdd"
        class="bg-blue text-white rounded-lg px-4 py-2.5 text-sm font-medium">
        + New project
      </button>
    </div>

    <div v-if="loading" class="text-dim font-mono text-sm animate-pulse">Loading…</div>
    <p v-else-if="error" class="text-sm text-error">{{ error }}</p>

    <div v-else class="space-y-2">
      <div v-for="p in projects" :key="p.id"
        class="flex items-start gap-4 border border-border rounded-xl px-4 py-3 bg-card hover:border-border/80 transition-colors">
        <span class="font-mono text-xs text-dim pt-0.5 w-6 flex-shrink-0">{{ p.num }}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-medium text-fg font-mono">{{ p.title }}</span>
            <span :class="[
              'text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono',
              p.visibility === 'public' ? 'bg-blue/10 text-blue' : 'bg-border text-dim',
            ]">{{ p.visibility }}</span>
          </div>
          <p class="text-xs text-fg2 mt-0.5 line-clamp-1">{{ p.desc }}</p>
          <div class="flex flex-wrap gap-1 mt-1.5">
            <span v-for="tag in p.tags" :key="tag"
              class="text-[10px] font-mono px-1.5 py-0.5 bg-bg border border-border rounded text-dim">{{ tag }}</span>
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button @click="openEdit(p)" class="text-xs text-dim hover:text-fg border border-border rounded px-2.5 py-1 transition-colors">Edit</button>
          <button @click="remove(p.id)" class="text-xs text-dim hover:text-error border border-border rounded px-2.5 py-1 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
        @click.self="showModal = false">
        <div class="bg-card border border-border rounded-2xl p-6 w-full max-w-[640px] max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-medium text-fg">{{ editingId ? 'Edit project' : 'New project' }}</h2>
            <button @click="showModal = false" class="text-dim hover:text-fg text-lg leading-none">×</button>
          </div>

          <form class="grid gap-4" @submit.prevent="save">
            <div class="grid gap-1.5">
              <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Title</label>
              <input v-model="form.title" type="text" required
                class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
            </div>
            <div class="grid gap-1.5">
              <label class="text-[11px] uppercase tracking-[0.18em] text-dim">
                Slug
                <span class="normal-case text-dim/60 ml-1">(auto-generated, editable)</span>
              </label>
              <input v-model="form.slug" type="text" placeholder="my-project-name"
                class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg font-mono outline-none focus:border-blue/60 transition-colors" />
            </div>
            <div class="grid gap-1.5">
              <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Description</label>
              <textarea v-model="form.description" rows="4"
                class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors resize-y" />
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="grid gap-1.5">
                <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Visibility</label>
                <select v-model="form.visibility"
                  class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div class="grid gap-1.5">
                <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Sort order</label>
                <input v-model.number="form.sort_order" type="number" min="0"
                  class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
              </div>
            </div>
            <div class="grid gap-1.5">
              <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Tags <span class="normal-case text-dim/60">(comma-separated)</span></label>
              <input v-model="form.tags" type="text" placeholder="Vue.js, Node.js, PostgreSQL"
                class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
            </div>
            <div class="grid gap-1.5">
              <label class="text-[11px] uppercase tracking-[0.18em] text-dim">
                Tech stack SVG icons
                <span class="normal-case text-dim/60 ml-1">(optional, one per line: tag=url)</span>
              </label>
              <textarea v-model="form.tag_icons" rows="3" placeholder="Vue.js=https://cdn.simpleicons.org/vuedotjs&#10;Node.js=https://cdn.simpleicons.org/nodedotjs"
                class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg font-mono outline-none focus:border-blue/60 transition-colors resize-y" />
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="grid gap-1.5">
                <label class="text-[11px] uppercase tracking-[0.18em] text-dim">GitHub URL</label>
                <input v-model="form.github_url" type="text" placeholder="https://github.com/..."
                  class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
              </div>
              <div class="grid gap-1.5">
                <label class="text-[11px] uppercase tracking-[0.18em] text-dim">Live URL</label>
                <input v-model="form.live_url" type="text" placeholder="https://..."
                  class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
              </div>
            </div>
            <div class="grid gap-1.5">
              <label class="text-[11px] uppercase tracking-[0.18em] text-dim">
                Image URL
                <span class="normal-case text-dim/60 ml-1">(optional banner, SVG accepted)</span>
              </label>
              <input v-model="form.image" type="text" placeholder="https://...image.svg or /projects/image.svg"
                class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
            </div>

            <p v-if="formError" class="text-sm text-error">{{ formError }}</p>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showModal = false"
                class="border border-border rounded-lg px-4 py-2.5 text-sm text-fg hover:bg-border/30 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="saving"
                class="bg-blue text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-60">
                {{ saving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
