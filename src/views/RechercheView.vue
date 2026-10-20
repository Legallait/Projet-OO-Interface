<script setup>
import { useRouter } from 'vue-router'
import { GENRES } from '../services/tmdb'
import SearchBar from '../components/SearchBar.vue'

const router = useRouter()

function browseGenre(genreId) {
  router.push({ path: '/resultats', query: { genre: genreId } })
}
</script>

<template>
  <section class="hero">
    <p class="kicker" title="Un film pour les gouverner tous">Votre cabinet de curiosités</p>
    <h1>Mon Précieux</h1>
    <p class="intro">
      Répertoriez, annotez et classez vos pépites cinématographiques.
    </p>

    <SearchBar class="search" />

    <h2>Parcourir par genre</h2>
    <div class="genres">
      <button v-for="genre in GENRES" :key="genre.id" type="button" @click="browseGenre(genre.id)">
        {{ genre.label }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 16px;
  text-align: center;
}

.kicker {
  margin: 0;
  font-family: var(--display);
  text-transform: uppercase;
  color: var(--gold);
}

h1 {
  margin: 8px 0;
  font-family: var(--display);
  font-size: clamp(3rem, 10vw, 6rem);
  color: var(--bordeaux);
}

.intro {
  max-width: 600px;
  font-size: 1.2rem;
}

.search {
  margin-top: 32px;
}

h2 {
  margin: 48px 0 16px;
  font-family: var(--display);
  font-size: 1rem;
  text-transform: uppercase;
  color: var(--bordeaux);
}

.genres {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 800px;
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
</style>
