<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { projects as staticProjects } from '../data/portfolio'
import { getProjects } from '../services/api'

const router = useRouter()

const projects = ref(staticProjects as { num: string; slug: string; title: string; desc: string; tags: string[]; tagIcons?: Record<string, string>; visibility: 'public' | 'private'; image?: string; github?: string; live?: string }[])

onMounted(async () => {
  try {
    const data = await getProjects()
    if (data?.length) projects.value = data
  } catch { /* keep static */ }
})
</script>

<template>
  <div class="max-w-[1100px] mx-auto px-6 py-10">

    <!-- Page header -->
    <section class="mb-8">
      <p class="font-mono text-xs text-dim mb-2">Most Popular</p>
      <h1 class="text-[clamp(1.6rem,4vw,2.4rem)] font-light text-fg -tracking-wide leading-tight">projects</h1>
    </section>

    <!-- Projects list -->
    <div class="flex flex-col gap-3 pb-10">
      <article
        v-for="project in projects"
        :key="project.num"
        class="relative border border-border rounded-lg p-4 pr-9 bg-card/30 hover:border-border-hi transition-colors group cursor-pointer"
        @click="router.push('/works/' + project.slug)"
      >
        <div class="flex items-start justify-between gap-3 mb-2.5">
          <div class="flex items-start gap-3 min-w-0 flex-1">
            <img
              v-if="project.image"
              :src="project.image"
              :alt="project.title"
              class="w-16 h-10 object-cover rounded-md border border-border bg-bg shrink-0"
            />
            <div class="flex items-center gap-2 flex-wrap min-w-0">
              <span class="font-mono text-[10px] text-dim">{{ project.num }}</span>
              <h2 class="text-sm font-medium text-fg">{{ project.title }}</h2>
              <span
                class="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                :class="project.visibility === 'private'
                  ? 'text-dim border-border'
                  : 'text-blue border-blue/30'"
              >// {{ project.visibility }}</span>
            </div>
          </div>
          <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="card-arrow absolute right-4 top-4" />
        </div>

        <div class="flex items-center gap-1.5 mb-3">
          <a
            v-if="project.github && project.github !== '#'"
            :href="project.github"
            target="_blank" rel="noopener"
            class="flex items-center gap-1 text-[11px] text-fg border border-border px-2.5 py-1 rounded-full hover:border-border-hi hover:bg-hover transition-colors no-underline"
            @click.stop
          >
            <FontAwesomeIcon :icon="['fab', 'github']" />
            Source
          </a>
          <span
            v-else-if="project.visibility === 'private'"
            class="flex items-center gap-1 text-[11px] text-dim border border-border px-2.5 py-1 rounded-full cursor-not-allowed opacity-50"
          >
            <FontAwesomeIcon :icon="['fas', 'lock']" />
            private
          </span>
          <a
            v-if="project.live"
            :href="project.live"
            target="_blank" rel="noopener"
            class="flex items-center gap-1 text-[11px] text-white bg-[color:var(--blue)] border border-[color:var(--blue)] px-2.5 py-1 rounded-full hover:opacity-90 transition-opacity no-underline"
            @click.stop
          >
            <FontAwesomeIcon :icon="['fas', 'play']" class="text-[9px]" />
            view
          </a>
        </div>

        <p class="text-xs text-fg2 leading-relaxed mb-3">{{ project.desc }}</p>

        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in project.tags"
            :key="tag"
            class="inline-flex items-center gap-1 text-[10px] text-dim border border-border rounded-full px-2 py-0.5 bg-card/60"
          >
            <img
              v-if="project.tagIcons?.[tag]"
              :src="project.tagIcons[tag]"
              :alt="`${tag} icon`"
              class="w-3 h-3 object-contain"
            />
            {{ tag }}
          </span>
        </div>
      </article>
    </div>

  </div>
</template>
