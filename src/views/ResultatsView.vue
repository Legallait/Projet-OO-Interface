<script setup>
import {computed, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {searchFilms, discoverByGenre, withDirectors, GENRES} from '../services/tmdb'
import FilmCard from '../components/FilmCard.vue'
import SearchBar from '../components/SearchBar.vue'

const route = useRoute()
const films = ref([])
const page = ref(1)
const totalPages = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const router = useRouter()

const title = computed(() => {
  if (route.query.q) return `« ${route.query.q} »`
  return GENRES.find((g) => g.id === Number(route.query.genre))?.label || ''
})

function browseGenre(genreId) {
  router.push({path: '/resultats', query: {genre: genreId}})
}

function fetchPage(pageNumber) {
  const {q, genre} = route.query
  return q ? searchFilms(q, pageNumber) : discoverByGenre(genre, pageNumber)
}

async function load() {
  const {q, genre} = route.query
  films.value = []
  page.value = 1
  totalPages.value = 0
  error.value = ''
  if (!q && !genre) return

  loading.value = true
  try {
    const results = await fetchPage(1)
    films.value = await withDirectors(results.films)
    totalPages.value = results.totalPages
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  loadingMore.value = true
  error.value = ''
  try {
    const results = await fetchPage(page.value + 1)
    // TMDB renvoie parfois un même film sur deux pages : on ignore les doublons
    const known = new Set(films.value.map((film) => film.id))
    films.value.push(...(await withDirectors(results.films.filter((film) => !known.has(film.id)))))
    page.value++
  } catch (e) {
    error.value = e.message
  } finally {
    loadingMore.value = false
  }
}

watch(() => route.query, load, {immediate: true})
</script>

<template>
  <section class="page">
    <SearchBar class="search"/>
    <h2 class="parcourir">Parcourir par genre</h2>
    <div class="genres">
      <button v-for="genre in GENRES" :key="genre.id" type="button" @click="browseGenre(genre.id)">
        {{ genre.label }}
      </button>
    </div>

    <h1>Résultats pour {{ title }}</h1>

    <p v-if="loading">Chargement…</p>
    <p v-else-if="error && !films.length" class="error">{{ error }}</p>
    <div v-else-if="!films.length" class="no-results">
      <p class="no-results-title">Aucun film trouvé</p>
      <p>Vérifiez l'orthographe ou essayez un autre titre, ou parcourez les genres ci-dessus.</p>
    </div>
    <p v-else>{{ films.length }} films affichés</p>

    <div class="grid">
      <FilmCard v-for="film in films" :key="film.id" :film="film"/>
    </div>

    <p v-if="error && films.length" class="error more-error">{{ error }}</p>
    <div v-if="!loading && page < totalPages" class="more">
      <button type="button" :disabled="loadingMore" @click="loadMore">
        {{ loadingMore ? 'Chargement…' : 'Charger plus' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.page {
  padding: 48px 40px;
  font-family: var(--display);

}

h1 {
  color: var(--bordeaux);
}

.search {
  margin: 0 auto 32px;
}

.error {
  color: #b00020;
}

.search {
  margin-top: 32px;
}

h2 {
  margin: 48px 0 16px;
  font-size: 1rem;
  text-transform: uppercase;
  color: var(--bordeaux);
}

.genres {
  justify-content: left;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.genres button {
  padding: 8px 16px;
  border: 1px solid var(--bordeaux);
  border-radius: 999px;
  background: var(--cream);
  color: var(--bordeaux);
  font: inherit;
  cursor: pointer;
}

.genres button:hover {
  background: var(--bordeaux);
  color: var(--gold);
}

.no-results {
  max-width: 480px;
  margin: 24px 0;
  padding: 32px;
  border: 1px dashed var(--bordeaux);
  border-radius: 8px;
  background: rgba(244, 236, 223, 0.85);
  font-family: var(--sans);
}

.no-results p {
  margin: 0;
}

.no-results-title {
  margin-bottom: 8px !important;
  color: var(--bordeaux);
  font-family: var(--display);
  font-size: 1.3rem;
  font-weight: 700;
}

.more {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.more button {
  padding: 12px 32px;
  border: none;
  border-radius: 4px;
  background: var(--bordeaux);
  color: var(--gold);
  font: inherit;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
}

.more button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.more-error {
  margin-top: 24px;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}
</style>
