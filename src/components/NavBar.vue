<script setup>
import {computed, ref, watch} from 'vue'
import {useStore} from 'vuex'
import {useRoute, useRouter} from 'vue-router'
import LogoutModal from './LogoutModal.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()
const currentUser = computed(() => store.state.currentUser)
const menuOpen = ref(false)
const showLogoutModal = ref(false)

watch(() => route.fullPath, () => (menuOpen.value = false))

function confirmLogout() {
  showLogoutModal.value = false
  store.dispatch('logout')
  router.push('/connexion')
}

const links = [
  {to: '/', name: 'recherche', label: 'Recherche'},
  {to: '/resultats', name: 'resultats', label: 'Résultats'},
  {to: '/library', name: 'bibliotheque', label: 'Ma bibliothèque'},
  {to: '/favorites', name: 'favoris', label: 'Favoris'},
]

const filmCount = computed(() => store.getters.libraryCount)
</script>

<template>
  <header class="navbar">
    <RouterLink to="/" class="brand">
      <img class="logo" src="../assets/logo.png" alt="logo"/>
      CinéClic
    </RouterLink>

    <button
        class="burger"
        :aria-expanded="menuOpen"
        aria-label="Menu"
        @click="menuOpen = !menuOpen"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div class="menu" :class="{ open: menuOpen }">
      <nav class="links">
        <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :class="{ active: route.name === link.name }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="account">
        <span class="count">{{ filmCount }} {{ filmCount > 1 ? 'films' : 'film' }}</span>
        <template v-if="currentUser">
          <span class="user">{{ currentUser }}</span>
          <button class="logout" @click="showLogoutModal = true">Déconnexion</button>
        </template>
        <RouterLink v-else to="/connexion" class="login">Connexion</RouterLink>
      </div>
    </div>

    <LogoutModal
        :open="showLogoutModal"
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirm-label="Se déconnecter"
        cancel-label="Annuler"
        @confirm="confirmLogout"
        @cancel="showLogoutModal = false"
    />
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 40px;
  background: var(--cream);
}

.logo {
  height: 40px;
  width: 40px;
  object-fit: contain;
  border-radius: 8px;
  flex-shrink: 0;
}

a {
  color: var(--bordeaux);
  text-decoration: none;
  font-family: var(--display);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.8rem;
  font-weight: 600;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--bordeaux);
  color: var(--gold);
  font-size: 0.9rem;
}

.menu {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
}

.burger span {
  width: 26px;
  height: 3px;
  border-radius: 2px;
  background: var(--bordeaux);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.links a {
  padding: 6px 12px;
  border-radius: 999px;
  text-transform: uppercase;
}

.links a.active {
  font-weight: 700;
  background: rgba(212, 160, 23, 0.25);
  box-shadow: 0 0 12px rgba(212, 160, 23, 0.5);
}

.count {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--gold);
  color: var(--bordeaux);
  font-family: var(--display);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.account {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user {
  font-weight: 600;
  color: var(--bordeaux);
}

.login,
.logout {
  padding: 6px 12px;
  border: 1px solid var(--bordeaux);
  border-radius: 4px;
  background: none;
  color: var(--bordeaux);
  font-family: var(--display);
  font-size: 0.8rem;
  cursor: pointer;
}

@media (max-width: 1000px) {
  .navbar {
    padding: 16px;
  }

  .burger {
    display: flex;
  }

  .menu {
    display: none;
    flex-basis: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .menu.open {
    display: flex;
  }

  .links {
    flex-direction: column;
    gap: 0;
    width: 100%;
    border-top: 2px solid var(--bordeaux);
  }

  .links a {
    padding: 14px 12px;
    border-radius: 0;
    border-bottom: 1px solid rgba(107, 28, 46, 0.2);
  }

  .links a.active {
    border-left: 4px solid var(--gold);
    box-shadow: none;
  }

  .account {
    width: 100%;
    padding-top: 4px;
  }

  .burger span {
    transition: transform 0.2s, opacity 0.2s;
  }

  .burger[aria-expanded='true'] span:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  .burger[aria-expanded='true'] span:nth-child(2) {
    opacity: 0;
  }

  .burger[aria-expanded='true'] span:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }
}
</style>