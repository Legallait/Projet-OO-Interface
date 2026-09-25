<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const isRegister = ref(false)
const username = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await store.dispatch(isRegister.value ? 'register' : 'login', {
      username: username.value.trim(),
      password: password.value,
    })
    router.push('/')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <section class="page">
    <form class="card" @submit.prevent="submit">
      <h1>{{ isRegister ? 'Créer un compte' : 'Connexion' }}</h1>

      <label>
        Nom d’utilisateur
        <input v-model="username" required autocomplete="username" />
      </label>

      <label>
        Mot de passe
        <input
          v-model="password"
          type="password"
          required
          minlength="4"
          :autocomplete="isRegister ? 'new-password' : 'current-password'"
        />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit">{{ isRegister ? 'Créer mon compte' : 'Se connecter' }}</button>

      <button type="button" class="switch" @click="isRegister = !isRegister; error = ''">
        {{ isRegister ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? En créer un' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  justify-content: center;
  padding: 64px 16px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 380px;
  padding: 32px;
  border: 1px solid var(--bordeaux);
  border-radius: 6px;
  background: var(--cream);
}

h1 {
  margin: 0 0 8px;
  font-family: var(--display);
  color: var(--bordeaux);
  text-align: center;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  color: var(--bordeaux);
}

input {
  padding: 10px;
  border: 1px solid var(--bordeaux);
  border-radius: 4px;
  font: inherit;
}

.error {
  margin: 0;
  color: #b00020;
}

button {
  padding: 12px;
  border: none;
  border-radius: 4px;
  background: var(--bordeaux);
  color: var(--gold);
  font-family: var(--display);
  font-weight: 700;
  cursor: pointer;
}

.switch {
  background: none;
  color: var(--bordeaux);
  font-family: var(--sans);
  font-weight: 400;
  text-decoration: underline;
}
</style>
