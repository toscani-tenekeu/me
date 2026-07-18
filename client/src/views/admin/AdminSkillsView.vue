<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getSkills, createSkillGroup, updateSkillGroup, deleteSkillGroup,
  createSkill, updateSkill, deleteSkill,
  type SkillGroupData, type SkillItem,
} from '../../services/api'

const loading = ref(true)
const error = ref('')
const groups = ref<SkillGroupData[]>([])
const expanded = ref<Set<number>>(new Set())

// New group form
const newGroupTitle = ref('')
const newGroupIconSvg = ref('')
const addingGroup = ref(false)

// Inline skill add per group
const newSkillLabel = ref<Record<number, string>>({})
const newSkillFeatured = ref<Record<number, boolean>>({})
const addingSkill = ref<Record<number, boolean>>({})

// Editing
const editingGroup = ref<Record<number, { title: string; icon_svg: string } | null>>({})
const editingSkill = ref<Record<number, { label: string; featured: boolean } | null>>({})

async function load() {
  try {
    groups.value = await getSkills()
    // expand all by default
    groups.value.forEach((g) => expanded.value.add(g.id))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function toggleExpand(id: number) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

async function addGroup() {
  if (!newGroupTitle.value.trim()) return
  addingGroup.value = true
  try {
    await createSkillGroup({ title: newGroupTitle.value.trim(), icon_svg: newGroupIconSvg.value.trim() })
    newGroupTitle.value = ''
    newGroupIconSvg.value = ''
    await load()
  } finally {
    addingGroup.value = false
  }
}

function startEditGroup(g: SkillGroupData) {
  editingGroup.value[g.id] = { title: g.title, icon_svg: g.icon_svg ?? '' }
}

async function saveGroup(g: SkillGroupData) {
  const data = editingGroup.value[g.id]
  if (!data) return
  await updateSkillGroup(g.id, { title: data.title, sort_order: g.sort_order, icon_svg: data.icon_svg })
  editingGroup.value[g.id] = null
  await load()
}

async function removeGroup(id: number) {
  if (!confirm('Delete this skill group and all its skills?')) return
  await deleteSkillGroup(id)
  await load()
}

async function addSkill(g: SkillGroupData) {
  const label = (newSkillLabel.value[g.id] ?? '').trim()
  if (!label) return
  addingSkill.value[g.id] = true
  try {
    await createSkill(g.id, { label, featured: newSkillFeatured.value[g.id] ?? false })
    newSkillLabel.value[g.id] = ''
    newSkillFeatured.value[g.id] = false
    await load()
  } finally {
    addingSkill.value[g.id] = false
  }
}

function startEditSkill(s: SkillItem) {
  editingSkill.value[s.id] = { label: s.label, featured: s.featured }
}

async function saveSkill(gid: number, s: SkillItem) {
  const data = editingSkill.value[s.id]
  if (!data) return
  await updateSkill(gid, s.id, { label: data.label, featured: data.featured, sort_order: s.sort_order })
  editingSkill.value[s.id] = null
  await load()
}

async function removeSkill(gid: number, id: number) {
  await deleteSkill(gid, id)
  await load()
}
</script>

<template>
  <div class="p-8 max-w-[860px]">
    <div class="mb-6">
      <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-dim mb-2">Portfolio Admin</p>
      <h1 class="text-[2rem] font-light text-fg -tracking-wide">Skills</h1>
    </div>

    <div v-if="loading" class="text-dim font-mono text-sm animate-pulse">Loading…</div>
    <p v-else-if="error" class="text-sm text-error">{{ error }}</p>

    <template v-else>
      <!-- Add group -->
      <div class="flex flex-col gap-2 mb-6">
        <div class="flex gap-2">
          <input v-model="newGroupTitle" type="text" placeholder="New group name…"
            @keydown.enter.prevent="addGroup"
            class="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
          <button @click="addGroup" :disabled="addingGroup || !newGroupTitle.trim()"
            class="bg-blue text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-60">
            + Add group
          </button>
        </div>
        <input v-model="newGroupIconSvg" type="text" placeholder="Icon SVG URL (optional — e.g. https://cdn.simpleicons.org/vuedotjs)"
          class="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-fg outline-none focus:border-blue/60 transition-colors" />
      </div>

      <!-- Groups -->
      <div class="space-y-3">
        <div v-for="g in groups" :key="g.id" class="border border-border rounded-xl overflow-hidden">
          <!-- Group header -->
          <div class="flex items-center gap-3 px-4 py-3 bg-card">
            <button @click="toggleExpand(g.id)" class="text-dim hover:text-fg text-xs w-4 text-center">
              {{ expanded.has(g.id) ? '▾' : '▸' }}
            </button>

            <template v-if="editingGroup[g.id]">
              <input v-model="editingGroup[g.id]!.title" @keydown.enter.prevent="saveGroup(g)"
                class="flex-1 bg-bg border border-border rounded px-3 py-1 text-sm text-fg outline-none focus:border-blue/60" />
              <input v-model="editingGroup[g.id]!.icon_svg" type="text" placeholder="Icon SVG URL (optional)"
                class="w-56 bg-bg border border-border rounded px-3 py-1 text-xs text-fg outline-none focus:border-blue/60" />
              <button @click="saveGroup(g)" class="text-xs text-blue hover:underline">Save</button>
              <button @click="editingGroup[g.id] = null" class="text-xs text-dim hover:text-fg">Cancel</button>
            </template>
            <template v-else>
              <span class="flex-1 font-mono text-sm text-fg">{{ g.title }}</span>
              <span class="text-xs text-dim">{{ g.skills.length }} skills</span>
              <button @click="startEditGroup(g)" class="text-xs text-dim hover:text-fg px-2">Edit</button>
              <button @click="removeGroup(g.id)" class="text-xs text-dim hover:text-error px-2">Delete</button>
            </template>
          </div>

          <!-- Skills list -->
          <div v-if="expanded.has(g.id)" class="px-4 pb-3 pt-1 space-y-1.5 bg-bg/40">
            <div v-for="s in g.skills" :key="s.id" class="flex items-center gap-2 py-1">
              <template v-if="editingSkill[s.id]">
                <input v-model="editingSkill[s.id]!.label"
                  class="flex-1 bg-bg border border-border rounded px-3 py-1 text-sm text-fg outline-none focus:border-blue/60" />
                <label class="flex items-center gap-1 text-xs text-dim cursor-pointer">
                  <input type="checkbox" v-model="editingSkill[s.id]!.featured" class="accent-blue" />
                  featured
                </label>
                <button @click="saveSkill(g.id, s)" class="text-xs text-blue hover:underline">Save</button>
                <button @click="editingSkill[s.id] = null" class="text-xs text-dim hover:text-fg">×</button>
              </template>
              <template v-else>
                <span :class="[
                  'flex-1 text-sm px-2.5 py-0.5 rounded-full w-fit',
                  s.featured
                    ? 'border border-blue/40 bg-blue/10 text-blue'
                    : 'border border-border bg-card text-fg2',
                ]">{{ s.label }}</span>
                <button @click="startEditSkill(s)" class="text-xs text-dim hover:text-fg">Edit</button>
                <button @click="removeSkill(g.id, s.id)" class="text-xs text-dim hover:text-error">×</button>
              </template>
            </div>

            <!-- Add skill -->
            <div class="flex items-center gap-2 pt-2 border-t border-border/40">
              <input v-model="newSkillLabel[g.id]" type="text" placeholder="Add skill…"
                @keydown.enter.prevent="addSkill(g)"
                class="flex-1 bg-bg border border-border rounded px-3 py-1.5 text-sm text-fg outline-none focus:border-blue/60" />
              <label class="flex items-center gap-1 text-xs text-dim cursor-pointer whitespace-nowrap">
                <input type="checkbox" v-model="newSkillFeatured[g.id]" class="accent-blue" />
                featured
              </label>
              <button @click="addSkill(g)" :disabled="addingSkill[g.id] || !(newSkillLabel[g.id] ?? '').trim()"
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
