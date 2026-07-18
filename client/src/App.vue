<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import PortfolioNavbar from './components/PortfolioNavbar.vue'
import PortfolioFooter from './components/PortfolioFooter.vue'
import TerminalModal from './components/TerminalModal.vue'
import { initTheme } from './composables/useTheme'
import { useTerminal } from './composables/useTerminal'

const { isOpen, open, close } = useTerminal()

onMounted(() => {
  initTheme()

  // Global keyboard shortcut Ctrl+K
  function onKey(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      open()
    }
  }

  // Triple-tap for mobile
  let tapCount = 0
  let tapTimer: ReturnType<typeof setTimeout> | null = null
  function onTouch() {
    tapCount++
    if (tapCount === 3) { open(); tapCount = 0 }
    if (tapTimer) clearTimeout(tapTimer)
    tapTimer = setTimeout(() => { tapCount = 0 }, 500)
  }

  window.addEventListener('keydown', onKey)
  window.addEventListener('touchstart', onTouch, { passive: true })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('touchstart', onTouch)
  })
})
</script>

<template>
  <PortfolioNavbar />
  <main class="flex-1">
    <RouterView />
  </main>
  <PortfolioFooter />
  <TerminalModal :open="isOpen" @close="close" />
</template>
