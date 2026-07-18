<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getCerts, createCertGroup, updateCertGroup, deleteCertGroup,
  createCert, updateCert, deleteCert,
  type CertGroupData, type CertData,
} from '../../services/api'

const loading = ref(true)
const error = ref('')
const groups = ref<CertGroupData[]>([])
const expanded = ref<Set<number>>(new Set())

// New group
const newGroupTitle = ref('')
const newGroupLayout = ref<'cards' | 'rows'>('cards')
const addingGroup = ref(false)

// Edit group
const editingGroup = ref<Record<number, { title: string; layout: string } | null>>({})

// New cert per group
type CertForm = { icon: string; title: string; org: string; year: string; badge: string; image: string }
const emptyForm = (): CertForm => ({ icon: 'certificate', title: '', org: '', year: '', badge: 'Certification', image: '' })
const newCert = ref<Record<number, CertForm>>({})
const addingCert = ref<Record<number, boolean>>({})

// Edit cert
const editingCert = ref<Record<number, CertForm | null>>({})

function certForm(id: number): CertForm {
  if (!newCert.value[id]) newCert.value[id] = emptyForm()
  return newCert.value[id] as CertForm
}

async function load() {
  loading.value = true
  try {
    groups.value = await getCerts()
    groups.value.forEach((g) => {
      expanded.value.add(g.id)
      if (!newCert.value[g.id]) newCert.value[g.id] = emptyForm()
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function toggle(id: number) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

async function addGroup() {
  if (!newGroupTitle.value.trim()) return
  addingGroup.value = true
  try {
    await createCertGroup({ title: newGroupTitle.value.trim(), layout: newGroupLayout.value })
    newGroupTitle.value = ''
    newGroupLayout.value = 'cards'
    await load()
  } finally {
    addingGroup.value = false
  }
}

function startEditGroup(g: CertGroupData) {
  editingGroup.value[g.id] = { title: g.title, layout: g.layout }
}

async function saveGroup(g: CertGroupData) {
  const d = editingGroup.value[g.id]
  if (!d) return
  await updateCertGroup(g.id, { title: d.title, layout: d.layout, sort_order: g.sort_order })
  editingGroup.value[g.id] = null
  await load()
}

async function removeGroup(id: number) {
  if (!confirm('Delete this cert group and all its certs?')) return
  await deleteCertGroup(id)
  await load()
}

async function addCert(g: CertGroupData) {
  const f = newCert.value[g.id]
  if (!f?.title.trim()) return
  addingCert.value[g.id] = true
  try {
    await createCert(g.id, { ...f, sort_order: g.items.length })
    newCert.value[g.id] = emptyForm()
    await load()
  } finally {
    addingCert.value[g.id] = false
  }
}

function startEditCert(c: CertData) {
  editingCert.value[c.id] = { icon: c.icon, title: c.title, org: c.org, year: c.year ?? '', badge: c.badge, image: c.image ?? '' }
}

async function saveCert(gid: number, c: CertData) {
  const d = editingCert.value[c.id]
  if (!d) return
  await updateCert(gid, c.id, { ...d, sort_order: c.sort_order })
  editingCert.value[c.id] = null
  await load()
}

async function removeCert(gid: number, id: number) {
  await deleteCert(gid, id)
  await load()
}

const badgeOptions = ['Certification', 'In Progress', 'Diploma', 'Baccalaureate']
const iconOptions = ['certificate', 'graduation-cap', 'scroll', 'award']
</script>

<template>
  <div class="p-8 max-w-[900px]">
    <div class="mb-6">
      <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-dim mb-2">Portfolio Admin</p>
      <h1 class="text-[2rem] font-light text-fg -tracking-wide">Certificates</h1>
    </div>

    <div v-if="loading" class="text-dim font-mono text-sm animate-pulse">Loading…</div>
    <p v-else-if="error" class="text-sm text-error">{{ error }}</p>

    <template v-else>
      <!-- Add group -->
      <div class="flex gap-2 mb-6 flex-wrap">
        <input v-model="newGroupTitle" type="text" placeholder="New group name…"
          class="flex-1 min-w-[180px] bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
        <select v-model="newGroupLayout"
          class="bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-fg outline-none">
          <option value="cards">Cards layout</option>
          <option value="rows">Rows layout</option>
        </select>
        <button @click="addGroup" :disabled="addingGroup || !newGroupTitle.trim()"
          class="bg-blue text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-60">
          + Add group
        </button>
      </div>

      <!-- Groups -->
      <div class="space-y-3">
        <div v-for="g in groups" :key="g.id" class="border border-border rounded-xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center gap-3 px-4 py-3 bg-card">
            <button @click="toggle(g.id)" class="text-dim text-xs w-4 text-center">
              {{ expanded.has(g.id) ? '▾' : '▸' }}
            </button>

            <template v-if="editingGroup[g.id]">
              <input v-model="editingGroup[g.id]!.title"
                class="flex-1 bg-bg border border-border rounded px-3 py-1 text-sm text-fg outline-none focus:border-blue/60" />
              <select v-model="editingGroup[g.id]!.layout"
                class="bg-bg border border-border rounded px-2 py-1 text-xs text-fg outline-none">
                <option value="cards">Cards</option>
                <option value="rows">Rows</option>
              </select>
              <button @click="saveGroup(g)" class="text-xs text-blue hover:underline">Save</button>
              <button @click="editingGroup[g.id] = null" class="text-xs text-dim hover:text-fg">Cancel</button>
            </template>
            <template v-else>
              <span class="flex-1 font-mono text-sm text-fg">{{ g.title }}</span>
              <span class="text-xs text-dim font-mono">{{ g.layout }}</span>
              <span class="text-xs text-dim">{{ g.items.length }} items</span>
              <button @click="startEditGroup(g)" class="text-xs text-dim hover:text-fg px-2">Edit</button>
              <button @click="removeGroup(g.id)" class="text-xs text-dim hover:text-error px-2">Delete</button>
            </template>
          </div>

          <!-- Cert items -->
          <div v-if="expanded.has(g.id)" class="px-4 pb-3 pt-1 bg-bg/40 space-y-2">
            <div v-for="c in g.items" :key="c.id" class="border border-border/50 rounded-lg p-3">
              <template v-if="editingCert[c.id]">
                <div class="grid sm:grid-cols-2 gap-2 mb-2">
                  <div class="grid gap-1">
                    <label class="text-[10px] text-dim uppercase tracking-wider">Icon</label>
                    <select v-model="editingCert[c.id]!.icon"
                      class="bg-bg border border-border rounded px-2 py-1.5 text-xs text-fg outline-none">
                      <option v-for="o in iconOptions" :key="o" :value="o">{{ o }}</option>
                    </select>
                  </div>
                  <div class="grid gap-1">
                    <label class="text-[10px] text-dim uppercase tracking-wider">Badge</label>
                    <select v-model="editingCert[c.id]!.badge"
                      class="bg-bg border border-border rounded px-2 py-1.5 text-xs text-fg outline-none">
                      <option v-for="b in badgeOptions" :key="b" :value="b">{{ b }}</option>
                    </select>
                  </div>
                  <div class="grid gap-1 sm:col-span-2">
                    <label class="text-[10px] text-dim uppercase tracking-wider">Title</label>
                    <input v-model="editingCert[c.id]!.title"
                      class="bg-bg border border-border rounded px-3 py-1.5 text-sm text-fg outline-none focus:border-blue/60" />
                  </div>
                  <div class="grid gap-1">
                    <label class="text-[10px] text-dim uppercase tracking-wider">Organisation</label>
                    <input v-model="editingCert[c.id]!.org"
                      class="bg-bg border border-border rounded px-3 py-1.5 text-sm text-fg outline-none focus:border-blue/60" />
                  </div>
                  <div class="grid gap-1">
                    <label class="text-[10px] text-dim uppercase tracking-wider">Year / Date</label>
                    <input v-model="editingCert[c.id]!.year"
                      class="bg-bg border border-border rounded px-3 py-1.5 text-sm text-fg outline-none focus:border-blue/60" />
                  </div>
                  <div class="grid gap-1 sm:col-span-2">
                    <label class="text-[10px] text-dim uppercase tracking-wider">Image path</label>
                    <input v-model="editingCert[c.id]!.image" placeholder="/certs/filename.jpg"
                      class="bg-bg border border-border rounded px-3 py-1.5 text-sm text-fg font-mono outline-none focus:border-blue/60" />
                  </div>
                </div>
                <div class="flex gap-2">
                  <button @click="saveCert(g.id, c)" class="text-xs text-blue border border-blue/40 rounded px-3 py-1 hover:bg-blue/10">Save</button>
                  <button @click="editingCert[c.id] = null" class="text-xs text-dim border border-border rounded px-3 py-1 hover:text-fg">Cancel</button>
                </div>
              </template>
              <template v-else>
                <div class="flex items-start gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-fg leading-snug">{{ c.title }}</p>
                    <p class="text-xs text-dim mt-0.5">{{ c.org }} <span v-if="c.year">· {{ c.year }}</span></p>
                    <div class="flex gap-2 mt-1">
                      <span class="text-[10px] font-mono text-dim border border-border/60 rounded px-1.5 py-0.5">{{ c.badge }}</span>
                      <span v-if="c.image" class="text-[10px] font-mono text-dim/60 truncate max-w-[140px]">{{ c.image }}</span>
                    </div>
                  </div>
                  <div class="flex gap-2 flex-shrink-0">
                    <button @click="startEditCert(c)" class="text-xs text-dim hover:text-fg border border-border rounded px-2 py-1">Edit</button>
                    <button @click="removeCert(g.id, c.id)" class="text-xs text-dim hover:text-error border border-border rounded px-2 py-1">×</button>
                  </div>
                </div>
              </template>
            </div>

            <!-- Add cert -->
            <div class="border border-dashed border-border/60 rounded-lg p-3 mt-2">
              <p class="text-[10px] uppercase tracking-wider text-dim mb-2">Add certificate</p>
              <div class="grid sm:grid-cols-2 gap-2 mb-2">
                <select v-model="certForm(g.id).icon"
                  class="bg-bg border border-border rounded px-2 py-1.5 text-xs text-fg outline-none">
                  <option v-for="o in iconOptions" :key="o" :value="o">{{ o }}</option>
                </select>
                <select v-model="certForm(g.id).badge"
                  class="bg-bg border border-border rounded px-2 py-1.5 text-xs text-fg outline-none">
                  <option v-for="b in badgeOptions" :key="b" :value="b">{{ b }}</option>
                </select>
                <input v-model="certForm(g.id).title" placeholder="Title…" class="sm:col-span-2 bg-bg border border-border rounded px-3 py-1.5 text-sm text-fg outline-none focus:border-blue/60" />
                <input v-model="certForm(g.id).org" placeholder="Organisation…" class="bg-bg border border-border rounded px-3 py-1.5 text-sm text-fg outline-none focus:border-blue/60" />
                <input v-model="certForm(g.id).year" placeholder="Year…" class="bg-bg border border-border rounded px-3 py-1.5 text-sm text-fg outline-none focus:border-blue/60" />
                <input v-model="certForm(g.id).image" placeholder="/certs/filename.jpg" class="sm:col-span-2 bg-bg border border-border rounded px-3 py-1.5 text-sm text-fg font-mono outline-none focus:border-blue/60" />
              </div>
              <button @click="addCert(g)" :disabled="addingCert[g.id] || !certForm(g.id).title.trim()"
                class="bg-blue text-white rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-60">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
