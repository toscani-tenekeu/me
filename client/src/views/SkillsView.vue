<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { skillGroups as staticSkillGroups } from '../data/portfolio'
import { getSkills } from '../services/api'

const groups = ref(staticSkillGroups as { title: string; icon_svg?: string; skills: { label: string; featured?: boolean }[] }[])

onMounted(async () => {
  try {
    const data = await getSkills()
    if (data?.length) groups.value = data
  } catch { /* keep static */ }
})
</script>

<template>
  <div class="max-w-[1100px] mx-auto px-6 py-10">

    <!-- Page header -->
    <section class="mb-8">
      <p class="font-mono text-xs text-dim mb-2">Full Tech Stack</p>
      <h1 class="text-[clamp(1.6rem,4vw,2.4rem)] font-light text-fg -tracking-wide leading-tight">skills</h1>
    </section>

    <!-- Skill groups -->
    <div class="space-y-8 pb-10">
      <div v-for="group in groups" :key="group.title">
        <p class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-dim mb-3">
          <img
            v-if="group.icon_svg"
            :src="group.icon_svg"
            :alt="`${group.title} icon`"
            class="w-3.5 h-3.5 object-contain"
          />
          <span class="text-blue">//</span>
          {{ group.title }}
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="skill in group.skills"
            :key="skill.label"
            class="text-xs px-3 py-1 rounded-full border"
            :class="skill.featured
              ? 'text-blue border-blue/40 bg-blue/5'
              : 'text-fg2 border-border bg-card/40'"
          >
            {{ skill.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Note -->
    <div class="border-l border-l-blue p-4 text-xs text-fg2 leading-relaxed">
      <strong class="text-fg font-medium">Always learning.</strong>
      I stay current by building real projects, shipping to production, and reading the documentation (not just the tutorials).
      If a technology solves the problem best, I'll pick it up.
    </div>

  </div>
</template>
