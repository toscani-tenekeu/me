<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { certGroups as staticCertGroups } from '../data/portfolio'
import { getCerts } from '../services/api'

const certGroups = ref(staticCertGroups as { title: string; layout: 'rows' | 'cards'; items: { icon: string; title: string; org: string; year?: string; badge: string; image?: string }[] }[])

onMounted(async () => {
  try {
    const data = await getCerts()
    if (data?.length) certGroups.value = data
  } catch { /* keep static */ }
})

function badgeClass(badge: string) {
  return {
    'In Progress':    'text-warning border-warning/30',
    'Diploma':        'text-blue border-blue/30',
    'Baccalaureate':  'text-blue border-blue/30',
    'Certification':  'text-dim border-border',
  }[badge] ?? 'text-dim border-border'
}
</script>

<template>
  <div class="max-w-[1100px] mx-auto px-6 py-10">

    <!-- Page header -->
    <section class="mb-8">
      <p class="font-mono text-xs text-dim mb-2">Certificates & Diplomas</p>
      <h1 class="text-[clamp(1.6rem,4vw,2.4rem)] font-light text-fg -tracking-wide leading-tight">certificates</h1>
    </section>

    <!-- Cert groups -->
    <div class="space-y-10 pb-10">
      <div v-for="group in certGroups" :key="group.title">
        <p class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-dim mb-4">
          <span class="text-blue">//</span>
          {{ group.title }}
        </p>

        <!-- Row layout (academic) -->
        <div v-if="group.layout === 'rows'" class="flex flex-col gap-2">
          <div
            v-for="item in group.items"
            :key="item.title"
            class="flex items-center gap-4 border border-border rounded-lg p-4 bg-card/30"
          >
            <div class="w-10 h-10 flex items-center justify-center border border-border rounded-lg bg-card shrink-0">
              <FontAwesomeIcon :icon="['fas', item.icon]" class="text-blue text-base" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-fg mb-0.5">{{ item.title }}</p>
              <p class="text-[11px] text-dim">{{ item.org }}</p>
              <p v-if="item.year" class="font-mono text-[10px] text-dim mt-0.5">{{ item.year }}</p>
            </div>
            <span
              class="text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 self-start"
              :class="badgeClass(item.badge)"
            >{{ item.badge }}</span>
          </div>
        </div>

        <!-- Card grid layout (certs with images) -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="item in group.items"
            :key="item.title"
            class="border border-border rounded-lg overflow-hidden bg-card/30 flex flex-col"
          >
            <!-- Image — size unchanged -->
            <div class="w-full aspect-[4/3] bg-deep flex items-center justify-center border-b border-border-lo overflow-hidden">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity"
                loading="lazy"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <FontAwesomeIcon v-else :icon="['fas', 'certificate']" class="text-4xl text-dim" />
            </div>
            <div class="p-3 flex items-start gap-2 flex-1">
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-fg mb-0.5">{{ item.title }}</p>
                <p class="text-[11px] text-dim mb-0.5">{{ item.org }}</p>
                <p v-if="item.year" class="font-mono text-[10px] text-dim">{{ item.year }}</p>
              </div>
              <span
                class="text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 self-start"
                :class="badgeClass(item.badge)"
              >{{ item.badge }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
