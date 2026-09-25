<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchFilms } from '../services/tmdb'

const MIN_LETTERS = 4
const DELAY = 300

const route = useRoute()
const router = useRouter()
const query = ref(route.query.q || '')
const suggestions = ref([])
let timer = null

watch(() => route.query.q, (q) => (query.value = q || ''))
watch(() => route.fullPath, close)

function onInput() {
  clearTimeout(timer)
  const q = query.value.trim()
  if (q.length < MIN_LETTERS) {
    suggestions.value = []
    return
  }
  timer = setTimeout(async () => {
    const films = await searchFilms(q).catch(() => [])
    if (q === query.value.trim()) suggestions.value = films.slice(0, 5)
  }, DELAY)
}

function close() {
  clearTimeout(timer)
  suggestions.value = []
}

function search() {
  const q = query.value.trim()
  close()
  if (q) router.push({ path: '/resultats', query: { q } })
}
</script>

<template>
  <div class="wrapper">
    <form class="bar" @submit.prevent="search">
      <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
      <input
        v-model="query"
        type="search"
        placeholder="Rechercher un film…"
        autocomplete="off"
        @input="onInput"
        @blur="close"
        @keydown.esc="close"
      />
      <button type="submit">Entrée</button>
    </form>

    <ul v-if="suggestions.length" class="suggestions">
      <li v-for="film in suggestions" :key="film.id" @mousedown.prevent="router.push(`/detail/${film.id}`)">
        <img v-if="film.poster" :src="film.poster" alt="" />
        <span v-else class="no-poster"></span>
        <strong>{{ film.title }}</strong>
        <span class="year">{{ film.year }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  max-width: 700px;
}

.bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 44px 24px;
  border-inline: 2px solid var(--bordeaux);
  background: white;
}

.bar::before,
.bar::after {
  content: '';
  position: absolute;
  left: -2px;
  right: -2px;
  height: 16px;
  background: var(--cream) repeating-linear-gradient(to right, transparent 0 12px, var(--bordeaux) 12px 26px, transparent 26px 34px) center / 100% 8px no-repeat;
}

.bar::before {
  top: 0;
}

.bar::after {
  bottom: 0;
}

.icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  fill: none;
  stroke: var(--bordeaux);
  stroke-width: 2.5;
  stroke-linecap: round;
}

input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-family: var(--display);
  font-size: 1.3rem;
  color: var(--bordeaux);
}

input::placeholder {
  color: #6b5a5a;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  background: var(--bordeaux);
  color: var(--gold);
  font-family: var(--display);
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin: 4px 0 0;
  padding: 0;
  border: 1px solid var(--bordeaux);
  border-radius: 4px;
  background: white;
  list-style: none;
  text-align: left;
}

li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  cursor: pointer;
}

li:hover {
  background: var(--cream);
}

li img,
.no-poster {
  width: 32px;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  background: #2a1a1e;
}

strong {
  flex: 1;
  color: var(--bordeaux);
}

.year {
  color: var(--gold);
  font-weight: 600;
}

@media (max-width: 600px) {
  .bar {
    gap: 10px;
    padding: 36px 12px;
  }

  input {
    font-size: 1rem;
  }

  button {
    padding: 10px 14px;
  }
}
</style>
