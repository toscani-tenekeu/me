<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toggle as toggleTheme } from '../composables/useTheme'
import { terminalCommands } from '../data/portfolio'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const router = useRouter()

interface Line {
  type: 'prompt' | 'out' | 'success' | 'error' | 'comment' | 'blank'
  text?: string
}

const inputRef = ref<HTMLInputElement | null>(null)
const outputRef = ref<HTMLElement | null>(null)
const inputValue = ref('')
const lines = ref<Line[]>([
  { type: 'success', text: 'Type "help" to get started.' },
  { type: 'blank' },
])
const history = ref<string[]>([])
const histIdx = ref(-1)

const KNOWN = Object.keys(terminalCommands) as (keyof typeof terminalCommands)[]

function scrollBottom() {
  nextTick(() => {
    if (outputRef.value) outputRef.value.scrollTop = outputRef.value.scrollHeight
  })
}

function pushLines(newLines: { type: string; text?: string }[]) {
  for (const l of newLines) {
    if (l.type === '__clear__') { lines.value = []; continue }
    lines.value.push(l as Line)
  }
  scrollBottom()
}

function run(raw: string) {
  const cmd = raw.trim().toLowerCase()
  if (!cmd) return

  lines.value.push({ type: 'prompt', text: `~ $ ${raw.trim()}` })
  history.value.unshift(raw.trim())
  histIdx.value = -1

  if (cmd === 'clear') {
    lines.value = []
    return
  }
  if (cmd === 'exit') {
    emit('close')
    return
  }
  if (cmd === 'theme') {
    toggleTheme()
    pushLines([{ type: 'success', text: 'Theme toggled.' }])
    return
  }
  if (cmd === 'skills') {
    pushLines(terminalCommands.skills())
    setTimeout(() => { router.push('/skills'); emit('close') }, 800)
    return
  }
  if (cmd === 'works') {
    pushLines(terminalCommands.works())
    setTimeout(() => { router.push('/works'); emit('close') }, 800)
    return
  }
  if (cmd === 'certs') {
    pushLines(terminalCommands.certs())
    setTimeout(() => { router.push('/certs'); emit('close') }, 800)
    return
  }
  if (cmd === 'contact') {
    pushLines(terminalCommands.contact())
    setTimeout(() => { router.push('/#contact'); emit('close') }, 800)
    return
  }

  const fn = terminalCommands[cmd as keyof typeof terminalCommands]
  if (fn) {
    pushLines(fn())
  } else {
    pushLines([{ type: 'error', text: `command not found: ${cmd}. Type "help".` }])
  }
}

function onEnter() {
  run(inputValue.value)
  inputValue.value = ''
}

function onTab(e: KeyboardEvent) {
  e.preventDefault()
  const val = inputValue.value.trim().toLowerCase()
  if (!val) return
  const match = KNOWN.find(k => k.startsWith(val))
  if (match) inputValue.value = match
}

function onUpDown(e: KeyboardEvent) {
  if (!history.value.length) return
  if (e.key === 'ArrowUp') {
    histIdx.value = Math.min(histIdx.value + 1, history.value.length - 1)
  } else {
    histIdx.value = Math.max(histIdx.value - 1, -1)
  }
  inputValue.value = histIdx.value >= 0 ? history.value[histIdx.value]! : ''
}

function onEsc() { emit('close') }

function onGlobalKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') onEsc()
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKey)
})

watch(() => props.open, (v) => {
  if (v) nextTick(() => inputRef.value?.focus())
})

const LINE_COLOR: Record<Line['type'], string> = {
  prompt:  'text-blue',
  out:     'text-fg2',
  success: 'text-blue',
  error:   'text-error',
  comment: 'text-dim',
  blank:   '',
}

function lineClass(type: Line['type']) {
  if (type === 'blank') return 'h-3'
  return `font-mono ${LINE_COLOR[type] ?? 'text-fg2'}`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="terminal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8"
        @click.self="emit('close')"
      >
        <div
          class="w-full max-w-[720px] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[520px] bg-deep border border-border"
          role="dialog"
          aria-label="Terminal"
        >
          <!-- Title bar -->
          <div class="flex items-center gap-2 px-4 py-3 shrink-0 bg-bg border-b border-border-lo">
            <span class="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer" @click="emit('close')"></span>
            <span class="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-blue-500/80"></span>
            <span class="ml-auto font-mono text-[11px] text-dim">Welcome to my shell</span>
          </div>

          <!-- Output -->
          <div ref="outputRef" class="flex-1 overflow-y-auto px-5 py-4 space-y-0.5 text-[13px] leading-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border bg-deep">
            <div
              v-for="(line, i) in lines"
              :key="i"
              :class="lineClass(line.type)"
            >{{ line.text ?? '' }}</div>
          </div>

          <!-- Input row -->
          <div class="flex items-center gap-2 px-5 py-3 shrink-0 bg-bg border-t border-border-lo">
            <span class="font-mono text-[13px] shrink-0 text-blue">~ $</span>
            <input
              ref="inputRef"
              v-model="inputValue"
              type="text"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
              class="flex-1 bg-transparent border-none outline-none font-mono text-[13px] text-fg caret-blue"
              placeholder="type a command..."
              @keydown.enter="onEnter"
              @keydown.tab="onTab"
              @keydown.up.prevent="onUpDown"
              @keydown.down.prevent="onUpDown"
              @keydown.esc="onEsc"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.terminal-fade-enter-active,
.terminal-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.terminal-fade-enter-from,
.terminal-fade-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
