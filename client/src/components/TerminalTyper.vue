<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const WORDS = ['ssh root@tenekeu', 'Welcome to my portfolio']
const TYPE_SPEED  = 85
const ERASE_SPEED = 50
const PAUSE_AFTER = 8000
const PAUSE_BEFORE = 2500

const displayed = ref('')
const showCursor = ref(true)

let timer: ReturnType<typeof setTimeout> | null = null
let cursorTimer: ReturnType<typeof setInterval> | null = null
let wordIndex = 0

function schedule(fn: () => void, delay: number) {
  timer = setTimeout(fn, delay)
}

function typeWord(word: string, charIndex: number) {
  if (charIndex <= word.length) {
    displayed.value = word.slice(0, charIndex)
    schedule(() => typeWord(word, charIndex + 1), TYPE_SPEED)
  } else {
    schedule(() => eraseWord(word, word.length), PAUSE_AFTER)
  }
}

function eraseWord(word: string, charIndex: number) {
  if (charIndex >= 0) {
    displayed.value = word.slice(0, charIndex)
    schedule(() => eraseWord(word, charIndex - 1), ERASE_SPEED)
  } else {
    wordIndex = (wordIndex + 1) % WORDS.length
    schedule(() => typeWord(WORDS[wordIndex]!, 0), PAUSE_BEFORE)
  }
}

onMounted(() => {
  cursorTimer = setInterval(() => { showCursor.value = !showCursor.value }, 530)
  schedule(() => typeWord(WORDS[0]!, 0), 400)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
  if (cursorTimer) clearInterval(cursorTimer)
})
</script>

<template>
  <span class="inline-flex items-baseline gap-px">
    <span class="whitespace-nowrap">{{ displayed }}</span>
    <span
      class="text-[0.75em] leading-none transition-opacity duration-100"
      :class="showCursor ? 'opacity-100' : 'opacity-0'"
    >█</span>
  </span>
</template>
