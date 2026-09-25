<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchFilms, discoverByGenre, GENRES } from '../services/tmdb'
import FilmCard from '../components/FilmCard.vue'
import SearchBar from '../components/SearchBar.vue'

const route = useRoute()
const films = ref([])
const loading = ref(false)
const error = ref('')

const title = computed(() => {
  if (route.query.q) return `« ${route.query.q} »`
  return GENRES.find((g) => g.id === Number(route.query.genre))?.label || ''
})

async function load() {
  const { q, genre } = route.query
  films.value = []
  error.value = ''
  if (!q && !genre) return

  loading.value = true
  try {
    films.value = q ? await searchFilms(q) : await discoverByGenre(genre)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

watch(() => route.query, load, { immediate: true })
</script>

<template>
  <section class="page">
    <SearchBar class="search" />

    <h1>Résultats pour {{ title }}</h1>

    <p v-if="loading">Chargement…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else>{{ films.length }} films trouvés</p>

    <div class="grid">
      <FilmCard v-for="film in films" :key="film.id" :film="film" />
    </div>
  </section>
</template>

<style scoped>
.page {
  padding: 48px 40px;
}

h1 {
  font-family: var(--display);
  color: var(--bordeaux);
}

.search {
  margin: 0 auto 32px;
}

.error {
  color: #b00020;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}
</style>
