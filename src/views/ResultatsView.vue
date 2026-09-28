<script setup>
import {computed, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {searchFilms, discoverByGenre, GENRES} from '../services/tmdb'
import FilmCard from '../components/FilmCard.vue'
import SearchBar from '../components/SearchBar.vue'

const route = useRoute()
const films = ref([])
const loading = ref(false)
const error = ref('')
const router = useRouter()

const title = computed(() => {
  if (route.query.q) return `« ${route.query.q} »`
  return GENRES.find((g) => g.id === Number(route.query.genre))?.label || ''
})

function browseGenre(genreId) {
  router.push({path: '/resultats', query: {genre: genreId}})
}

async function load() {
  const {q, genre} = route.query
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
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else>{{ films.length }} films trouvés</p>

    <div class="grid">
      <FilmCard v-for="film in films" :key="film.id" :film="film"/>
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

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}
</style>
