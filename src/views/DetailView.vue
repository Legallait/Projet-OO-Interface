<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getFilm, getRecommendations } from '../services/tmdb'

const route = useRoute()
const router = useRouter()
const store = useStore()
const film = ref(null)
const recommendations = ref([])
const loading = ref(false)
const error = ref('')
const showMenu = ref(false)

const STATUS_LABELS = { toWatch: 'À voir', watched: 'Vu' }

const saved = computed(() => film.value && store.getters.getFilm(film.value.id))

function requireLogin() {
  if (store.state.currentUser) return true
  router.push('/connexion')
  return false
}

function toggleMenu() {
  if (requireLogin()) showMenu.value = !showMenu.value
}

function setStatus(status) {
  store.dispatch('setFilmStatus', { film: film.value, status })
  showMenu.value = false
}

function remove() {
  store.dispatch('removeFilm', film.value.id)
  showMenu.value = false
}

function toggleFavorite() {
  if (requireLogin()) store.dispatch('toggleFavorite', film.value)
}

// 99 -> "1h 39min"
function formatRuntime(minutes) {
  if (!minutes) return 'Inconnue'
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}min`
}

async function load(id) {
  film.value = null
  showMenu.value = false
  recommendations.value = []
  error.value = ''
  if (!id) return

  loading.value = true
  try {
    const [details, similar] = await Promise.all([getFilm(id), getRecommendations(id)])
    film.value = details
    recommendations.value = similar.slice(0, 4)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <section class="page">
    <p v-if="!route.params.id">Choisissez un film depuis la recherche pour voir son détail.</p>
    <p v-else-if="loading">Chargement…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else-if="film">
      <div class="detail">
        <div class="poster">
          <img v-if="film.poster" :src="film.poster" :alt="film.title" />
        </div>

        <div class="content">
          <div class="tags">
            <span v-for="genre in film.genres" :key="genre" class="tag">{{ genre }}</span>
          </div>

          <h1>{{ film.title }}</h1>
          <p class="overview">{{ film.overview || 'Aucun résumé disponible.' }}</p>

          <dl class="infos">
            <div>
              <dt>Réalisateur</dt>
              <dd>{{ film.director }}</dd>
            </div>
            <div>
              <dt>Durée</dt>
              <dd>{{ formatRuntime(film.runtime) }}</dd>
            </div>
            <div>
              <dt>Pays</dt>
              <dd>{{ film.countries || 'Inconnu' }}</dd>
            </div>
            <div>
              <dt>Année de sortie</dt>
              <dd>{{ film.year }}</dd>
            </div>
          </dl>

          <div class="actions">
            <div class="library">
              <button class="primary" @click="toggleMenu">
                {{ saved ? 'Dans ma bibliothèque · ' + STATUS_LABELS[saved.status] : 'Ajouter à ma bibliothèque' }}
              </button>
              <div v-if="showMenu" class="menu">
                <button
                  v-for="(label, status) in STATUS_LABELS"
                  :key="status"
                  :class="{ active: saved?.status === status }"
                  @click="setStatus(status)"
                >
                  {{ label }}
                </button>
                <button v-if="saved" @click="remove">Retirer</button>
              </div>
            </div>

            <button class="secondary" :class="{ active: saved?.favorite }" @click="toggleFavorite">
              {{ saved?.favorite ? '♥' : '♡' }} Favori
            </button>
          </div>
        </div>
      </div>

      <template v-if="recommendations.length">
        <h2>Dans la même veine</h2>
        <div class="similar">
          <RouterLink
            v-for="reco in recommendations"
            :key="reco.id"
            :to="`/detail/${reco.id}`"
            class="similar-card"
          >
            <img v-if="reco.poster" :src="reco.poster" :alt="reco.title" />
            <div>
              <strong>{{ reco.title }}</strong>
              <span>{{ reco.year }}</span>
            </div>
          </RouterLink>
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 40px;
}

.error {
  color: #b00020;
}

.detail {
  display: flex;
  flex-wrap: wrap;
  gap: 48px;
}

.poster {
  flex: 0 0 320px;
  aspect-ratio: 2 / 3;
  padding: 12px;
  border: 6px dashed var(--cream);
  border-radius: 8px;
  background: var(--bordeaux);
}

.poster img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  flex: 1;
  min-width: 280px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 10px;
  border-radius: 4px;
  background: var(--gold);
  color: var(--bordeaux);
  font-family: var(--display);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  margin: 16px 0;
  font-family: var(--display);
  font-size: 2.8rem;
  color: var(--bordeaux);
}

.overview {
  line-height: 1.6;
}

.infos {
  margin: 24px 0 0;
  padding: 8px 16px;
  border: 1px solid var(--bordeaux);
  border-radius: 6px;
  background: white;
}

.infos div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
}

dt {
  font-family: var(--display);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--bordeaux);
}

dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
}

.actions button {
  padding: 12px 20px;
  border-radius: 4px;
  font-family: var(--display);
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
}

.library {
  position: relative;
}

.primary {
  border: none;
  background: var(--bordeaux);
  color: var(--gold);
}

.menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-width: 100%;
  border: 1px solid var(--bordeaux);
  border-radius: 4px;
  background: white;
}

.menu button {
  border: none;
  border-radius: 0;
  background: none;
  color: var(--bordeaux);
  text-align: left;
}

.menu button:hover,
.menu button.active {
  background: var(--cream);
}

.secondary {
  border: 1px solid var(--bordeaux);
  background: none;
  color: var(--bordeaux);
}

.secondary.active {
  background: var(--bordeaux);
  color: var(--gold);
}

h2 {
  margin: 56px 0 16px;
  font-family: var(--display);
  text-transform: uppercase;
  color: var(--bordeaux);
}

.similar {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.similar-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid var(--bordeaux);
  border-radius: 6px;
  background: white;
  color: var(--bordeaux);
  text-decoration: none;
}

.similar-card img {
  width: 50px;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.similar-card div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.similar-card span {
  color: var(--gold);
}
</style>
