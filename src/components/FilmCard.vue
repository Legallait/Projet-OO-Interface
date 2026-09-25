<script setup>
defineProps({
  film: { type: Object, required: true },
})
</script>

<template>
  <RouterLink :to="`/detail/${film.id}`" class="card">
    <div class="poster">
      <img v-if="film.poster" :src="film.poster" :alt="film.title" />
    </div>
    <div class="info">
      <h2>{{ film.title }}</h2>
      <span>{{ film.year }}</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  overflow: hidden;
  border-radius: 6px;
  background: var(--bordeaux);
  text-decoration: none;
}

.poster {
  aspect-ratio: 2 / 3;
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
  color: var(--gold);
}

h2 {
  margin: 0 0 4px;
  font-size: 1rem;
}
</style>
