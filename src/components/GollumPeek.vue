<script setup>
import {onMounted, onUnmounted, ref} from 'vue'

const QUOTES = [
  'Mon précieux…',
  'Il est à nous, le film, à nous !',
  'Qu\'est-ce qu\'il a dans ses poches, hein ?',
  'Sméagol aime les films, oui, précieux.',
  'Des voleurs ! Des voleurs de films !',
]
const SECRET = 'precieux'

const visible = ref(false)
const quote = ref('')
let typed = ''
let hideTimer = null

function show(message) {
  quote.value = message || QUOTES[Math.floor(Math.random() * QUOTES.length)]
  visible.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => (visible.value = false), 4000)
}

function onKey(event) {
  if (event.key.length !== 1) return
  const key = event.key.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  typed = (typed + key).slice(-SECRET.length)
  if (typed === SECRET) show()
}

function onGollum(event) {
  show(event.detail)
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('gollum', onGollum)
  console.log('%cMon précieux… 💍', 'color:#d4a017;font-size:16px;font-family:serif')
  console.log('Psst… tapez « precieux » n\'importe où sur la page.')
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('gollum', onGollum)
  clearTimeout(hideTimer)
})
</script>

<template>
  <div class="gollum" :class="{ visible }" aria-live="polite" @click="visible = false">
    <p v-if="visible" class="bubble">{{ quote }}</p>
    <img src="../assets/gouloum.webp" alt="Gollum" />
  </div>
</template>

<style scoped>
.gollum {
  position: fixed;
  right: 24px;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  transform: translateY(110%);
  transition: transform 0.5s cubic-bezier(0.3, 1.4, 0.6, 1);
  pointer-events: none;
}

.gollum.visible {
  transform: translateY(4%);
  pointer-events: auto;
  cursor: pointer;
}

img {
  width: min(320px, 70vw);
  border-radius: 50% 50% 0 0;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
}

.bubble {
  max-width: 220px;
  margin: 0 40px 12px 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--surface);
  color: var(--bordeaux);
  font-family: var(--display);
  font-style: italic;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

@media (max-width: 600px) {
  .gollum {
    right: 16px;
  }
}
</style>
