<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import ConfirmModal from '../components/ConfirmModal.vue'

const route = useRoute()
const store = useStore()

const GOAL = 20 // objectif de films vus dans l'année

const STATUS_LABELS = { toWatch: 'À voir', watched: 'Vu' }

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

const SORTS = {
  recent: { label: 'Ajout récent', compare: (a, b) => b.index - a.index },
  oldest: { label: 'Ajout ancien', compare: (a, b) => a.index - b.index },
  title: { label: 'Titre (A → Z)', compare: (a, b) => a.title.localeCompare(b.title, 'fr') },
  yearDesc: { label: 'Année (récent)', compare: (a, b) => (b.year || 0) - (a.year || 0) },
  yearAsc: { label: 'Année (ancien)', compare: (a, b) => (a.year || 0) - (b.year || 0) },
}

const search = ref('')
const sort = ref('recent')

// Action en attente de confirmation : { type: 'unfavorite' | 'delete', film }
const pending = ref(null)

const modal = computed(() => {
  if (!pending.value) return null
  const title = pending.value.film.title
  if (pending.value.type === 'unfavorite') {
    return {
      title: 'Retirer des favoris',
      message: `Êtes-vous sûr de vouloir retirer « ${title} » de vos favoris ?`,
      confirmLabel: 'Retirer',
    }
  }
  return {
    title: 'Supprimer ce film',
    message: `Êtes-vous sûr de vouloir supprimer « ${title} » de votre bibliothèque ?`,
    confirmLabel: 'Supprimer',
  }
})

const filtered = computed(() => {
  if (route.name === 'favoris') return store.getters.favorites
  if (route.query.filtre === 'a-voir') return store.getters.toWatch
  if (route.query.filtre === 'vus') return store.getters.watched
  return store.state.library
})

// "Écran" -> "ecran" : la recherche ignore les accents et la casse
function normalize(text) {
  return (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// La bibliothèque est rangée dans l'ordre d'ajout : sa position sert de date d'ajout
const films = computed(() => {
  const q = normalize(search.value.trim())
  return filtered.value
    .map((film) => ({ ...film, index: store.state.library.indexOf(film) }))
    .filter((film) => !q || normalize(film.title).includes(q) || normalize(film.director).includes(q))
    .sort(SORTS[sort.value].compare)
})

function isActive(tab) {
  return route.fullPath === tab.to
}

function toggleWatched(film) {
  const status = film.status === 'watched' ? 'toWatch' : 'watched'
  store.dispatch('setFilmStatus', { film, status })
}

// Ajouter aux favoris : direct. Retirer des favoris : confirmation.
function onFavorite(film) {
  if (film.favorite) pending.value = { type: 'unfavorite', film }
  else store.dispatch('toggleFavorite', film)
}

function onDelete(film) {
  pending.value = { type: 'delete', film }
}

function confirmPending() {
  const { type, film } = pending.value
  pending.value = null
  if (type === 'unfavorite') store.dispatch('toggleFavorite', film)
  else store.dispatch('removeFilm', film.id)
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
        <div class="controls">
          <input v-model="search" type="search" placeholder="Rechercher un titre, un réalisateur…" />
          <select v-model="sort" aria-label="Trier par">
            <option v-for="(option, key) in SORTS" :key="key" :value="key">{{ option.label }}</option>
          </select>
        </div>
      </div>
      <p class="note">Données hébergées en local dans votre navigateur</p>

      <p v-if="!filtered.length" class="none">
        Aucun film ici pour l'instant.
        <RouterLink to="/">Rechercher un film</RouterLink>
      </p>
      <p v-else-if="!films.length" class="none">
        Aucun film ne correspond à « {{ search }} ».
        <button type="button" class="reset" @click="search = ''">Effacer la recherche</button>
      </p>

      <div class="grid">
        <article v-for="film in films" :key="film.id" class="card">
          <RouterLink :to="`/detail/${film.id}`" class="link">
            <div class="poster">
              <img v-if="film.poster" :src="film.poster" :alt="film.title" loading="lazy" />
              <span v-else class="placeholder">{{ film.title }}</span>
              <span class="status" :class="film.status">{{ STATUS_LABELS[film.status] }}</span>
              <span v-if="film.favorite" class="fav-badge" title="Favori">♥</span>
            </div>
            <div class="info">
              <h2 :title="film.title">{{ film.title }}</h2>
              <p class="meta">
                <span class="director" :title="film.director">{{ film.director }}</span>
                <span v-if="film.year" class="year">{{ film.year }}</span>
              </p>
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
              @click="onFavorite(film)"
            >
              <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z" /></svg>
            </button>
            <button class="delete" title="Supprimer" @click="onDelete(film)">
              <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
            </button>
          </div>
        </article>
      </div>
    </section>

    <ConfirmModal
      :open="Boolean(pending)"
      :title="modal?.title"
      :message="modal?.message"
      :confirm-label="modal?.confirmLabel"
      cancel-label="Annuler"
      @confirm="confirmPending"
      @cancel="pending = null"
    />
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

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.controls input,
.controls select {
  padding: 8px 12px;
  border: 1px solid var(--bordeaux);
  border-radius: 4px;
  background: white;
  color: #2a1a1e;
  font: inherit;
  font-size: 0.9rem;
}

.controls input {
  width: 260px;
  max-width: 100%;
}

.controls input:focus,
.controls select:focus {
  outline: 2px solid var(--gold);
  outline-offset: 1px;
}

.note {
  margin: -16px 0 24px;
  font-size: 0.85rem;
  opacity: 0.75;
}

.reset {
  border: none;
  background: none;
  color: var(--bordeaux);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.none a {
  color: var(--bordeaux);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 24px;
}

.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(212, 160, 23, 0.35);
  border-radius: 8px;
  background: var(--bordeaux);
  box-shadow: 0 4px 12px rgba(42, 26, 30, 0.25);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.card:hover,
.card:focus-within {
  transform: translateY(-4px);
  border-color: var(--gold);
  box-shadow: 0 12px 28px rgba(42, 26, 30, 0.4);
}

.link {
  flex: 1;
  display: flex;
  flex-direction: column;
  color: inherit;
  text-decoration: none;
}

.poster {
  position: relative;
  overflow: hidden;
  aspect-ratio: 2 / 3;
  background: #2a1a1e;
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.card:hover img {
  transform: scale(1.05);
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  color: var(--gold);
  font-family: var(--display);
  text-align: center;
}

/* Badges posés sur l'affiche : statut à gauche, favori à droite */
.status {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.status.toWatch {
  border: 1px solid var(--gold);
  background: rgba(42, 26, 30, 0.85);
  color: var(--gold);
}

.status.watched {
  background: var(--gold);
  color: var(--bordeaux);
}

.fav-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(42, 26, 30, 0.85);
  color: #e0475b;
  font-size: 0.95rem;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border-top: 2px solid var(--gold);
}

h2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
  margin: 0;
  color: var(--gold);
  font-family: var(--display);
  font-size: 0.95rem;
  line-height: 1.3;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  color: var(--cream);
  font-size: 0.85rem;
}

.director {
  overflow: hidden;
  opacity: 0.85;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.year {
  flex: none;
  color: var(--gold);
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid rgba(212, 160, 23, 0.25);
  background: rgba(0, 0, 0, 0.18);
}

.actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid rgba(212, 160, 23, 0.6);
  border-radius: 50%;
  background: none;
  color: var(--gold);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.actions button:hover {
  border-color: var(--gold);
  background: rgba(212, 160, 23, 0.15);
}

.actions button.on {
  border-color: var(--gold);
  background: var(--gold);
  color: var(--bordeaux);
}

.actions .delete {
  margin-left: auto;
  border-color: rgba(244, 236, 223, 0.35);
  color: var(--cream);
}

.actions .delete:hover {
  border-color: #e0475b;
  background: #e0475b;
  color: white;
}

svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

@media (max-width: 600px) {
  .banner {
    gap: 24px;
    padding: 24px 16px;
    border-block-width: 6px;
  }

  h1 {
    margin-bottom: 16px;
    font-size: 1.6rem;
  }

  .stats {
    width: 100%;
    gap: 10px;
  }

  .stats div {
    flex: 1;
    width: auto;
  }

  .page {
    padding: 20px 16px 40px;
  }

  .toolbar {
    gap: 12px;
    margin-bottom: 24px;
  }

  /* Les 4 onglets tiennent sur une seule ligne */
  .tabs {
    flex-wrap: nowrap;
    width: 100%;
    gap: 6px;
  }

  .tabs a {
    flex: 1;
    padding: 8px 4px;
    font-size: 0.75rem;
    text-align: center;
  }

  .controls {
    width: 100%;
    flex-wrap: nowrap;
  }

  .controls input {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  .note {
    margin: -8px 0 16px;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  h2 {
    font-size: 0.85rem;
  }

  .info {
    padding: 10px;
  }

  .meta {
    font-size: 0.75rem;
  }

  .actions {
    gap: 6px;
    padding: 8px 10px;
  }

  .actions button {
    width: 32px;
    height: 32px;
  }
}
</style>