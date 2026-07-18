<script setup lang="ts">
import { RouterLink } from 'vue-router'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-bg border-t border-border mt-auto">
    <div class="max-w-[1100px] mx-auto px-6 pt-8 pb-6">

      <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 mb-6">
        <!-- Brand -->
        <div>
          <p class="font-mono text-xs text-fg mb-1">Toscani TENEKEU MODJOU</p>
          <p class="text-xs text-dim leading-relaxed max-w-[360px]">
            Founder of KmerHosting &amp; Full-Stack Developer.
          </p>
        </div>

        <!-- Nav cols -->
        <div class="flex gap-10 flex-wrap">
          <div class="flex flex-col gap-1.5">
            <p class="font-mono text-[10px] uppercase tracking-widest text-dim mb-1">Portfolio</p>
            <RouterLink to="/skills" class="text-xs text-fg2 hover:text-link transition-colors no-underline">Skills</RouterLink>
            <RouterLink to="/works"  class="text-xs text-fg2 hover:text-link transition-colors no-underline">Works</RouterLink>
            <RouterLink to="/certs"  class="text-xs text-fg2 hover:text-link transition-colors no-underline">Certs</RouterLink>
            <RouterLink to="/#contact" class="text-xs text-fg2 hover:text-link transition-colors no-underline">Contact</RouterLink>
          </div>
          <div class="flex flex-col gap-1.5">
            <p class="font-mono text-[10px] uppercase tracking-widest text-dim mb-1">Links</p>
            <a href="https://github.com/toscani-tenekeu" target="_blank" rel="noopener" class="text-xs text-fg2 hover:text-link transition-colors no-underline">GitHub</a>
            <a href="https://linkedin.com/in/toscani-tenekeu" target="_blank" rel="noopener" class="text-xs text-fg2 hover:text-link transition-colors no-underline">LinkedIn</a>
          </div>
        </div>
      </div>

      <hr class="border-0 border-t border-border-lo mb-4" />

      <div class="flex items-center justify-between flex-wrap gap-3">
        <p class="text-[11px] text-dim">
          &copy; {{ year }} Toscani TENEKEU MODJOU. Hosted by
          <a href="https://kmerhosting.com" target="_blank" rel="noopener" class="text-link font-medium hover:underline">KmerHosting</a>.
        </p>
        <div class="flex items-center gap-3">
          <a href="https://toscani-tenekeu.com" target="_blank" rel="noopener noreferrer"
             class="text-white inline-flex items-center gap-1.5 text-xs font-medium bg-blue px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity no-underline">
            <FontAwesomeIcon :icon="['fas', 'graduation-cap']" class="text-[10px] text-white" />
            Learn programming
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
