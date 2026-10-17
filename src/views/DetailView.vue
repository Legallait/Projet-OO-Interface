<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
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

// 7.43 -> "7,4"
function formatRating(rating) {
  return rating.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// "Ben Affleck" -> "BA"
function initials(name) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('')
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

// L'image du film remplace le fond du site, sous un voile crème pour garder le texte lisible
watch(film, (value) => {
  document.body.style.backgroundImage = value?.backdrop
    ? `linear-gradient(rgba(244, 236, 223, 0.82), rgba(244, 236, 223, 0.82)), url(${value.backdrop})`
    : ''
})

onUnmounted(() => {
  document.body.style.backgroundImage = ''
})
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
          <p v-if="film.votes" class="rating">
            <span class="stars" :style="{ '--fill': `${film.rating * 10}%` }" aria-hidden="true">★★★★★</span>
            <strong>{{ formatRating(film.rating) }}</strong>/10
            <span class="votes">· {{ film.votes.toLocaleString('fr-FR') }} votes</span>
          </p>
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

      <template v-if="film.cast.length">
        <h2>Casting</h2>
        <ul class="cast">
          <li v-for="actor in film.cast" :key="actor.id">
            <img v-if="actor.photo" :src="actor.photo" :alt="actor.name" loading="lazy" />
            <span v-else class="avatar">{{ initials(actor.name) }}</span>
            <strong>{{ actor.name }}</strong>
            <span v-if="actor.character" class="character">{{ actor.character }}</span>
          </li>
        </ul>
      </template>

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

.rating {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: -4px 0 16px;
  color: var(--bordeaux);
}

/* Étoiles remplies au prorata de la note grâce à un dégradé net */
.stars {
  margin-right: 4px;
  background: linear-gradient(90deg, var(--gold) var(--fill), rgba(107, 28, 46, 0.2) var(--fill));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 1.3rem;
  letter-spacing: 2px;
}

.rating strong {
  font-size: 1.3rem;
}

.votes {
  opacity: 0.7;
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

.cast {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 24px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cast li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.cast img,
.avatar {
  width: 96px;
  height: 96px;
  margin-bottom: 6px;
  border: 3px solid var(--gold);
  border-radius: 50%;
  object-fit: cover;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bordeaux);
  color: var(--gold);
  font-family: var(--display);
  font-size: 1.4rem;
  font-weight: 700;
}

.cast strong {
  color: var(--bordeaux);
  font-size: 0.95rem;
}

.character {
  font-size: 0.85rem;
  font-style: italic;
  opacity: 0.75;
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

@media (max-width: 600px) {
  .page {
    padding: 24px 16px 40px;
  }

  .detail {
    flex-direction: column;
    gap: 24px;
  }

  .poster {
    flex: none;
    align-self: center;
    width: min(240px, 70%);
    padding: 8px;
    border-width: 4px;
  }

  .content {
    min-width: 0;
  }

  h1 {
    font-size: 2rem;
  }

  .infos div {
    padding: 8px 0;
  }

  /* Boutons pleine largeur, faciles à toucher */
  .actions {
    flex-direction: column;
    gap: 10px;
  }

  .library,
  .actions button {
    width: 100%;
  }

  h2 {
    margin-top: 40px;
    font-size: 1.3rem;
  }

  /* Casting en bandeau qu'on fait défiler du doigt */
  .cast {
    display: flex;
    gap: 16px;
    margin: 0 -16px;
    padding: 0 16px 8px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }

  .cast li {
    flex: 0 0 96px;
    scroll-snap-align: start;
  }

  .cast img,
  .avatar {
    width: 80px;
    height: 80px;
  }

  .cast strong {
    font-size: 0.85rem;
  }

  .character {
    font-size: 0.75rem;
  }
}
</style>
