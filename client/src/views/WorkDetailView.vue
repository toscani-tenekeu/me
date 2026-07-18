<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProject, type ProjectData } from '../services/api'
import { projects as staticProjects } from '../data/portfolio'

const route = useRoute()
const slug = route.params.slug as string

const project = ref<ProjectData | null>(null)
const loading = ref(true)
const notFound = ref(false)

onMounted(async () => {
  // Instant render from static fallback while API loads
  const s = staticProjects.find(p => p.slug === slug)
  if (s) {
    project.value = {
      id: 0,
      num: s.num,
      slug: s.slug,
      title: s.title,
      desc: s.desc,
      tags: s.tags,
      visibility: s.visibility,
      image: s.image,
      github: s.github,
      live: s.live,
      tagIcons: s.tagIcons,
    }
  }
  try {
    project.value = await getProject(slug)
  } catch {
    if (!project.value) notFound.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="min-h-[70vh] py-14 px-6">
    <div class="max-w-[780px] mx-auto">

      <!-- Back link -->
      <RouterLink
        to="/works"
        class="inline-flex items-center gap-2 text-sm text-dim no-underline hover:text-link transition-colors mb-10"
      >
        <FontAwesomeIcon :icon="['fas', 'chevron-left']" class="text-[0.65rem]" />
        All projects
      </RouterLink>

      <!-- Loading skeleton -->
      <template v-if="loading && !project">
        <div class="h-8 w-2/3 bg-card rounded mb-4 animate-pulse" />
        <div class="h-4 w-1/4 bg-card rounded mb-8 animate-pulse" />
        <div class="space-y-2">
          <div class="h-4 bg-card rounded animate-pulse" />
          <div class="h-4 bg-card rounded animate-pulse" />
          <div class="h-4 w-3/4 bg-card rounded animate-pulse" />
        </div>
      </template>

      <!-- Not found -->
      <template v-else-if="notFound">
        <p class="text-dim">Project not found.</p>
      </template>

      <!-- Project content -->
      <template v-else-if="project">

        <!-- Optional banner image -->
        <div v-if="project.image" class="mb-8 rounded-lg overflow-hidden border border-border">
          <img :src="project.image" :alt="project.title" class="w-full object-cover max-h-64" />
        </div>

        <!-- Title row -->
        <div class="flex items-start gap-3 flex-wrap mb-2">
          <h1 class="text-2xl font-bold tracking-tight text-fg leading-snug m-0">{{ project.title }}</h1>
          <span
            v-if="project.visibility === 'private'"
            class="mt-1 text-xs font-medium px-2 py-0.5 rounded-full border border-border text-dim"
          >private</span>
        </div>

        <!-- Tags -->
        <div class="flex flex-wrap gap-2 mb-8">
          <span
            v-for="tag in project.tags"
            :key="tag"
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-card border border-border text-dim font-mono"
          >
            <img
              v-if="project.tagIcons?.[tag]"
              :src="project.tagIcons[tag]"
              :alt="`${tag} icon`"
              class="w-3.5 h-3.5 object-contain"
            />
            {{ tag }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-fg/80 leading-relaxed mb-10 whitespace-pre-line">{{ project.desc }}</p>

        <!-- Action buttons -->
        <div class="flex flex-wrap gap-3">
          <a
            v-if="project.github && project.github !== '#'"
            :href="project.github"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-border text-fg text-sm no-underline hover:border-border-hi hover:bg-hover transition-colors"
          >
            <FontAwesomeIcon :icon="['fab', 'github']" />
            GitHub Source
          </a>
          <a
            v-if="project.live && project.live !== '#'"
            :href="project.live"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue text-white text-sm no-underline hover:opacity-90 transition-opacity"
          >
            <FontAwesomeIcon :icon="['fas', 'arrow-up-right-from-square']" class="text-xs" />
            Live site
          </a>
        </div>

      </template>

    </div>
  </main>
</template>
