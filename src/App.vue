<script setup>
import { watch } from 'vue'
import { useStore } from 'vuex'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'

const store = useStore()

watch(
  () => store.state.theme,
  (theme) => {
    document.documentElement.dataset.theme = theme
  },
  { immediate: true }
)
</script>

<template>
  <NavBar />
  <main>
    <RouterView />
  </main>
  <AppFooter />
</template>
