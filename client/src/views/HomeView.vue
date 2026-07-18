<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { hero as staticHero, contact as staticContact, projects as staticProjects, certGroups as staticCertGroups, skillGroups as staticSkillGroups } from '../data/portfolio'
import { getHero, getContact, getProjects, getCerts, getSkills } from '../services/api'

const heroPromptDone = ref(false)


const hero = ref({ ...staticHero })
const contact = ref({ ...staticContact })
const projectsList = ref(staticProjects as { num: string; slug: string; title: string; desc: string; tags: string[]; tagIcons?: Record<string, string>; visibility: 'public' | 'private'; image?: string; github?: string; live?: string }[])
const certGroupsList = ref(staticCertGroups as typeof staticCertGroups)
const skills = ref<{ title: string; skills: { label: string }[] }[]>(staticSkillGroups)

onMounted(async () => {
  setTimeout(() => { heroPromptDone.value = true }, 1200)
  // Fetch all data from API silently — static data remains if API is down
  const [h, c, p, certs, s] = await Promise.allSettled([getHero(), getContact(), getProjects(), getCerts(), getSkills()])
  if (h.status === 'fulfilled') hero.value = h.value
  if (c.status === 'fulfilled') contact.value = c.value as typeof staticContact
  if (p.status === 'fulfilled' && p.value?.length) projectsList.value = p.value
  if (certs.status === 'fulfilled' && certs.value?.length) certGroupsList.value = certs.value as unknown as typeof staticCertGroups
  if (s.status === 'fulfilled' && s.value?.length) skills.value = s.value
})

const previewProjects = computed(() => projectsList.value.slice(0, 3))
const previewCertItems = computed(() => certGroupsList.value[0]?.items ?? [])

const previewSkills = computed(() =>
  skills.value.slice(0, 4).map(group => ({
    label: group.title,
    items: group.skills
      .slice(0, 5)
      .map(skill => skill.label)
      .join(' · ')
  }))
)

</script>

<template>
  <!-- Hero -->
  <section class="min-h-[calc(100vh-60px)] flex flex-col justify-center py-20 max-w-[1100px] mx-auto px-6">
    <p class="font-mono text-sm text-dim mb-5 flex items-center gap-2">
      <span v-if="!heroPromptDone" class="inline-block w-[9px] h-[1.1em] bg-dim align-middle animate-pulse"></span>
    </p>

    <h1 class="text-[clamp(3rem,8vw,6rem)] font-light text-fg leading-[1.0] -tracking-wider mb-6">
      {{ hero.name }}<br />
      <span class="text-fg2">{{ hero.lastName }}</span>
    </h1>

    <p class="text-base text-dim mb-4">
      {{ hero.role }}
      <template v-if="hero.tagline">
        <span class="text-dim/50 mx-1.5">|</span>
        <span class="text-sm text-dim/70 font-light font-mono">{{ hero.tagline }}</span>
      </template>
    </p>

    <p class="text-lg text-fg2 leading-relaxed max-w-[560px] mb-8" v-html="hero.bio"></p>

    <div class="flex gap-3 flex-wrap mb-10">
      <RouterLink to="/works"
        class="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-blue bg-blue text-white hover:opacity-90 transition-opacity no-underline">
        View my work
        <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="text-xs" />
      </RouterLink>
      <RouterLink to="/#contact"
        class="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-border text-fg hover:border-border-hi hover:bg-hover transition-colors no-underline">
        Get in touch
      </RouterLink>
    </div>

    <p class="font-mono text-xs text-dim">
      <span class="hidden sm:inline">
        Press <kbd class="bg-card border border-border px-1.5 py-0.5 rounded text-[11px]">Ctrl</kbd>
        +
        <kbd class="bg-card border border-border px-1.5 py-0.5 rounded text-[11px]">K</kbd>
        to open terminal
      </span>
      <span class="sm:hidden">Triple-tap to open terminal</span>
    </p>
  </section>

  <hr class="border-0 border-t border-border-lo" />

  <!-- Skills preview -->
  <!-- Skills preview -->
  <section id="skills" class="py-14 max-w-[1100px] mx-auto px-6">
    <p class="font-mono text-[10px] uppercase tracking-widest text-dim mb-4">
      Tech Stack
    </p>

    <div class="flex flex-col divide-y divide-border-lo mb-5">
      <RouterLink v-for="sg in previewSkills" :key="sg.label" to="/skills"
        class="group relative flex items-start justify-between gap-4 py-4 pr-8 no-underline hover:bg-hover/50 transition-colors -mx-2 pl-2 rounded-lg">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="font-mono text-[10px] text-dim">
              stack
            </span>

            <h2 class="text-sm font-medium text-fg">
              {{ sg.label }}
            </h2>
          </div>

          <p class="text-xs text-fg2 leading-relaxed max-w-[700px]">
            {{ sg.items }}
          </p>
        </div>

        <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="card-arrow absolute right-2 top-4" />
      </RouterLink>
    </div>

    <RouterLink to="/skills"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-fg border border-border px-3 py-1.5 rounded-full hover:border-border-hi hover:bg-hover transition-colors no-underline">
      All skills
      <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="text-[10px]" />
    </RouterLink>
  </section>

  <hr class="border-0 border-t border-border-lo" />

  <!-- Projects preview -->
  <section id="works" class="py-14 max-w-[1100px] mx-auto px-6">
    <p class="font-mono text-[10px] uppercase tracking-widest text-dim mb-4">Most Popular</p>
    <div class="flex flex-col divide-y divide-border-lo mb-5">
      <RouterLink v-for="project in previewProjects" :key="project.num" :to="'/works/' + project.slug"
        class="group relative flex items-start justify-between gap-4 py-4 pr-8 no-underline hover:bg-hover/50 transition-colors -mx-2 pl-2 rounded-lg">
        <img v-if="project.image" :src="project.image" :alt="project.title"
          class="hidden sm:block w-16 h-10 object-cover rounded-md border border-border bg-bg shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="font-mono text-[10px] text-dim">{{ project.num }}</span>
            <h2 class="text-sm font-medium text-fg">{{ project.title }}</h2>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded border" :class="project.visibility === 'private'
              ? 'text-dim border-border'
              : 'text-blue border-blue/30'">{{ project.visibility }}</span>
          </div>
          <p class="text-xs text-fg2 leading-relaxed mb-2 max-w-[700px] line-clamp-2">{{ project.desc }}</p>
          <div class="flex flex-wrap gap-1">
            <span v-for="tag in project.tags.slice(0, 5)" :key="tag"
              class="inline-flex items-center gap-1 text-[10px] text-dim border border-border rounded-full px-2 py-0.5">
              <img v-if="project.tagIcons?.[tag]" :src="project.tagIcons[tag]" :alt="`${tag} icon`"
                class="w-3 h-3 object-contain" />
              {{ tag }}
            </span>
          </div>
        </div>
        <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="card-arrow absolute right-2 top-4" />
      </RouterLink>
    </div>
    <RouterLink to="/works"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-fg border border-border px-3 py-1.5 rounded-full hover:border-border-hi hover:bg-hover transition-colors no-underline">
      All projects
      <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="text-[10px]" />
    </RouterLink>
  </section>

  <hr class="border-0 border-t border-border-lo" />

  <!-- Certs preview -->
  <section id="certs" class="py-14 max-w-[1100px] mx-auto px-6">
    <p class="font-mono text-[10px] uppercase tracking-widest text-dim mb-4">Certificates & Diplomas</p>
    <div class="flex flex-col gap-2 mb-5">
      <div v-for="item in previewCertItems" :key="item.title"
        class="flex items-center gap-3 border border-border rounded-lg p-3">
        <div class="w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-card shrink-0">
          <FontAwesomeIcon :icon="['fas', item.icon]" class="text-blue text-sm" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-fg">{{ item.title }}</p>
          <p class="text-[11px] text-dim">{{ item.org }}</p>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded border shrink-0" :class="{
          'text-warning border-warning/30': item.badge === 'In Progress',
          'text-blue border-blue/30': item.badge === 'Diploma' || item.badge === 'Baccalaureate',
          'text-dim border-border': item.badge === 'Certification',
        }">{{ item.badge }}</span>
      </div>
    </div>
    <RouterLink to="/certs"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-fg border border-border px-3 py-1.5 rounded-full hover:border-border-hi hover:bg-hover transition-colors no-underline">
      All certificates
      <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="text-[10px]" />
    </RouterLink>
  </section>

  <hr class="border-0 border-t border-border-lo" />

  <!-- Contact -->
  <section id="contact" class="py-14 max-w-[1100px] mx-auto px-6">
    <div class="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-12">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-widest text-dim mb-3">Contact</p>
        <p class="text-[clamp(1.4rem,3vw,2rem)] font-light text-fg leading-tight mb-3">
          Got a <em>project</em>?<br />
        </p>
        <p class="text-xs text-dim">What's on your mind?</p>
      </div>
      <div class="flex flex-col divide-y divide-border-lo">
        <a :href="`mailto:${contact.email}`"
          class="flex items-center justify-between py-3 text-xs text-fg2 hover:text-link no-underline transition-colors group">
          <span class="flex items-center gap-2.5">
            <FontAwesomeIcon :icon="['fas', 'envelope']" class="text-blue w-3.5" />
            Email
          </span>
          <span class="font-mono text-[10px] text-dim group-hover:text-link transition-colors">
            <FontAwesomeIcon :icon="['fas', 'arrow-up-right-from-square']" class="text-[9px]" />
          </span>
        </a>
        <a :href="contact.github" target="_blank" rel="noopener"
          class="flex items-center justify-between py-3 text-xs text-fg2 hover:text-link no-underline transition-colors group">
          <span class="flex items-center gap-2.5">
            <FontAwesomeIcon :icon="['fab', 'github']" class="text-blue w-3.5" />
            GitHub
          </span>
          <span class="font-mono text-[10px] text-dim group-hover:text-link transition-colors">
            <FontAwesomeIcon :icon="['fas', 'arrow-up-right-from-square']" class="text-[9px]" />
          </span>
        </a>
        <a :href="contact.linkedin" target="_blank" rel="noopener"
          class="flex items-center justify-between py-3 text-xs text-fg2 hover:text-link no-underline transition-colors group">
          <span class="flex items-center gap-2.5">
            <FontAwesomeIcon :icon="['fab', 'linkedin']" class="text-blue w-3.5" />
            LinkedIn
          </span>
          <span class="font-mono text-[10px] text-dim group-hover:text-link transition-colors">
            <FontAwesomeIcon :icon="['fas', 'arrow-up-right-from-square']" class="text-[9px]" />
          </span>
        </a>
        <a :href="contact.youtubeFr || contact.youtubeEn" target="_blank" rel="noopener"
          class="flex items-center justify-between py-3 text-xs text-fg2 hover:text-link no-underline transition-colors group">
          <span class="flex items-center gap-2.5">
            <FontAwesomeIcon :icon="['fab', 'youtube']" class="text-blue w-3.5" />
            YouTube
          </span>
          <span class="font-mono text-[10px] text-dim group-hover:text-link transition-colors">
            <FontAwesomeIcon :icon="['fas', 'arrow-up-right-from-square']" class="text-[9px]" />
          </span>
        </a>
      </div>
    </div>

  </section>
</template>
