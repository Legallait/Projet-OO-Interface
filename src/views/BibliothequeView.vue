<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()

const GOAL = 20 // objectif de films vus dans l'année

const TABS = [
  { label: 'Tous', to: '/library' },
  { label: 'À voir', to: '/library?filtre=a-voir' },
  { label: 'Vus', to: '/library?filtre=vus' },
  { label: 'Favoris', to: '/favorites' },
]

const currentUser = computed(() => store.state.currentUser)
const total = computed(() => store.getters.libraryCount)
const watchedCount = computed(() => store.getters.watched.length)
const toWatchCount = computed(() => store.getters.toWatch.length)
const progress = computed(() => Math.min(100, Math.round((watchedCount.value / GOAL) * 100)))

const films = computed(() => {
  if (route.name === 'favoris') return store.getters.favorites
  if (route.query.filtre === 'a-voir') return store.getters.toWatch
  if (route.query.filtre === 'vus') return store.getters.watched
  return store.state.library
})

function isActive(tab) {
  return route.fullPath === tab.to
}

function toggleWatched(film) {
  const status = film.status === 'watched' ? 'toWatch' : 'watched'
  store.dispatch('setFilmStatus', { film, status })
}
</script>

<template>
  <section v-if="!currentUser" class="empty">
    <p>Connectez-vous pour retrouver votre bibliothèque.</p>
    <RouterLink to="/connexion" class="cta">Connexion</RouterLink>
  </section>

  <template v-else>
    <header class="banner">
      <div>
        <p class="kicker">Votre salle privée</p>
        <h1>Ma Bibliothèque Personnelle</h1>
        <div class="goal">
          <span>Objectif de l'année : {{ watchedCount }}/{{ GOAL }} films vus</span>
          <span class="percent">{{ progress }}%</span>
        </div>
        <div class="bar"><div :style="{ width: progress + '%' }"></div></div>
      </div>

      <div class="stats">
        <div><strong>{{ total }}</strong>Tous</div>
        <div><strong>{{ watchedCount }}</strong>Vus</div>
        <div><strong>{{ toWatchCount }}</strong>À voir</div>
      </div>
    </header>

    <section class="page">
      <div class="toolbar">
        <nav class="tabs">
          <RouterLink v-for="tab in TABS" :key="tab.to" :to="tab.to" :class="{ active: isActive(tab) }">
            {{ tab.label }}
          </RouterLink>
        </nav>
        <span class="note">Données hébergées en local dans votre navigateur</span>
      </div>

      <p v-if="!films.length" class="none">
        Aucun film ici pour l'instant.
        <RouterLink to="/">Rechercher un film</RouterLink>
      </p>

      <div class="grid">
        <article v-for="film in films" :key="film.id" class="card">
          <RouterLink :to="`/detail/${film.id}`" class="link">
            <div class="poster">
              <img v-if="film.poster" :src="film.poster" :alt="film.title" />
            </div>
            <div class="info">
              <h2>{{ film.title }}</h2>
              <span>{{ film.director }} ({{ film.year }})</span>
            </div>
          </RouterLink>

          <div class="actions">
            <button
              :class="{ on: film.status === 'watched' }"
              :title="film.status === 'watched' ? 'Marquer « À voir »' : 'Marquer « Vu »'"
              @click="toggleWatched(film)"
            >
              <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
            </button>
            <button
              :class="{ on: film.favorite }"
              :title="film.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
              @click="store.dispatch('toggleFavorite', film)"
            >
              <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z" /></svg>
            </button>
            <button class="delete" title="Supprimer" @click="store.dispatch('removeFilm', film.id)">
              <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
            </button>
          </div>
        </article>
      </div>
    </section>
  </template>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 16px;
  font-size: 1.2rem;
  text-align: center;
}

.cta {
  padding: 12px 24px;
  border-radius: 4px;
  background: var(--bordeaux);
  color: var(--gold);
  font-family: var(--display);
  text-decoration: none;
}

.banner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  padding: 32px 40px;
  border-block: 10px dashed var(--cream);
  background: var(--bordeaux);
  color: var(--cream);
}

.kicker {
  margin: 0;
  font-family: var(--display);
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--gold);
}

h1 {
  max-width: 360px;
  margin: 8px 0 24px;
  font-family: var(--display);
  font-size: 2.2rem;
}

.goal {
  display: flex;
  justify-content: space-between;
  width: min(360px, 100%);
  font-size: 0.85rem;
}

.percent {
  color: var(--gold);
  font-weight: 600;
}

.bar {
  width: min(360px, 100%);
  height: 6px;
  margin-top: 8px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
}

.bar div {
  height: 100%;
  border-radius: 3px;
  background: var(--gold);
}

.stats {
  display: flex;
  gap: 16px;
}

.stats div {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  padding: 12px 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  text-transform: uppercase;
}

.stats strong {
  font-family: var(--display);
  font-size: 1.6rem;
  color: var(--gold);
}

.page {
  padding: 24px 40px 48px;
  background: var(--cream);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tabs a {
  padding: 8px 14px;
  border: 1px solid var(--bordeaux);
  border-radius: 4px;
  color: var(--bordeaux);
  font-family: var(--display);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  text-decoration: none;
}

.tabs a.active {
  background: var(--bordeaux);
  color: var(--gold);
}

.note {
  font-size: 0.85rem;
}

.none a {
  color: var(--bordeaux);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.card {
  overflow: hidden;
  border: 1px solid var(--bordeaux);
  border-radius: 6px;
  background: white;
}

.link {
  color: inherit;
  text-decoration: none;
}

.poster {
  aspect-ratio: 2 / 3;
  border-bottom: 6px dashed var(--bordeaux);
  background: #2a1a1e;
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  padding: 12px;
}

h2 {
  margin: 0 0 4px;
  font-size: 1rem;
  color: var(--bordeaux);
}

.info span {
  font-size: 0.8rem;
}

.actions {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: var(--cream);
}

.actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--bordeaux);
  border-radius: 50%;
  background: white;
  color: var(--bordeaux);
  cursor: pointer;
}

.actions button.on {
  background: var(--bordeaux);
  color: var(--gold);
}

.actions .delete {
  margin-left: auto;
}

svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
</style>
