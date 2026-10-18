<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import ConfirmModal from './ConfirmModal.vue'

const props = defineProps({
  film: { type: Object, required: true },
})

const store = useStore()
const router = useRouter()

const saved = computed(() => Boolean(store.getters.getFilm(props.film.id)))
const showRemoveModal = ref(false)

function toggleLibrary() {
  if (!store.state.currentUser) {
    router.push('/connexion')
    return
  }
  if (saved.value) showRemoveModal.value = true
  else store.dispatch('setFilmStatus', { film: props.film, status: 'toWatch' })
}

function confirmRemove() {
  showRemoveModal.value = false
  store.dispatch('removeFilm', props.film.id)
}
</script>

<template>
  <article class="card">
    <RouterLink :to="`/detail/${film.id}`" class="link">
      <div class="poster">
        <img v-if="film.poster" :src="film.poster" :alt="film.title" loading="lazy" />
        <span v-else class="placeholder">{{ film.title }}</span>
        <span v-if="film.year" class="year">{{ film.year }}</span>
      </div>
      <div class="info">
        <h2 :title="film.title">{{ film.title }}</h2>
        <p v-if="film.director" class="director">
          <span class="label">Réalisation</span>
          <span class="name" :title="film.director">{{ film.director }}</span>
        </p>
      </div>
    </RouterLink>

    <button
      type="button"
      class="add"
      :class="{ saved }"
      :title="saved ? 'Retirer de ma bibliothèque' : 'Ajouter à ma bibliothèque'"
      :aria-label="saved ? 'Retirer de ma bibliothèque' : 'Ajouter à ma bibliothèque'"
      @click="toggleLibrary"
    >
      <svg v-if="saved" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" /></svg>
      <svg v-else viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
      <span>{{ saved ? 'Ajouté' : 'Ajouter' }}</span>
    </button>

    <ConfirmModal
      :open="showRemoveModal"
      title="Retirer ce film"
      :message="`Êtes-vous sûr de vouloir retirer « ${film.title} » de votre bibliothèque ?`"
      confirm-label="Retirer"
      cancel-label="Annuler"
      @confirm="confirmRemove"
      @cancel="showRemoveModal = false"
    />
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(212, 160, 23, 0.35);
  border-radius: 8px;
  background: var(--bordeaux);
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(42, 26, 30, 0.25);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.card:hover,
.card:focus-within {
  transform: translateY(-6px);
  border-color: var(--gold);
  box-shadow: 0 12px 28px rgba(42, 26, 30, 0.4);
}

.link {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-decoration: none;
}

/* Bouton bibliothèque : discret sur l'affiche, il se déplie au survol de la card */
.add {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--gold);
  border-radius: 999px;
  background: rgba(42, 26, 30, 0.85);
  color: var(--gold);
  font-family: var(--sans);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.add span {
  overflow: hidden;
  max-width: 0;
  white-space: nowrap;
  transition: max-width 0.25s ease, margin-left 0.25s ease;
}

.card:hover .add span,
.add:focus-visible span {
  max-width: 80px;
  margin-left: 6px;
}

.add:hover,
.add.saved {
  background: var(--gold);
  color: var(--bordeaux);
}

.add svg {
  flex: none;
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
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
  text-align: center;
}

.year {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(42, 26, 30, 0.85);
  color: var(--gold);
  font-family: var(--sans);
  font-size: 0.8rem;
  font-weight: 600;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 16px;
  border-top: 2px solid var(--gold);
  text-align: center;
}

/* Hauteur réservée pour 2 lignes : les réalisateurs restent alignés d'une card à l'autre */
h2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
  margin: 0;
  color: var(--gold);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.director {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding-top: 10px;
  border-top: 1px solid rgba(212, 160, 23, 0.25);
  font-family: var(--sans);
}

.label {
  color: var(--gold);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.75;
}

.name {
  overflow: hidden;
  color: var(--cream);
  font-size: 0.9rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .info {
    gap: 8px;
    padding: 10px;
  }

  h2 {
    font-size: 0.85rem;
  }

  .director {
    padding-top: 8px;
  }

  .label {
    font-size: 0.6rem;
  }

  .name {
    font-size: 0.8rem;
  }

  .year {
    top: 6px;
    right: 6px;
    font-size: 0.7rem;
  }

  .add {
    top: 6px;
    left: 6px;
    height: 28px;
  }
}
</style>