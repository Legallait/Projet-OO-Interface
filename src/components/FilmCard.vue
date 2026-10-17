<script setup>
defineProps({
  film: { type: Object, required: true },
})
</script>

<template>
  <RouterLink :to="`/detail/${film.id}`" class="card">
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
</template>

<style scoped>
.card {
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
.card:focus-visible {
  transform: translateY(-6px);
  border-color: var(--gold);
  box-shadow: 0 12px 28px rgba(42, 26, 30, 0.4);
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
</style>
