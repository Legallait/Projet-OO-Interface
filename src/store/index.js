import { createStore } from 'vuex'

const USERS_KEY = import.meta.env.VITE_USERS_KEY
const SESSION_KEY = import.meta.env.VITE_SESSION_KEY
const LIBRARY_KEY = import.meta.env.VITE_LIBRARY_KEY
const THEME_KEY = 'cineclic-theme'

// Une bibliothèque par compte : cineclic-library-<nom d'utilisateur>
function loadLibrary(username) {
  if (!username) return []
  return JSON.parse(localStorage.getItem(`${LIBRARY_KEY}-${username}`)) || []
}

function saveLibrary(state) {
  localStorage.setItem(`${LIBRARY_KEY}-${state.currentUser}`, JSON.stringify(state.library))
}

async function hash(password) {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Chaque film : { id, title, year, poster, director, status: 'toWatch' | 'watched', favorite }
export default createStore({
  state: {
    users: JSON.parse(localStorage.getItem(USERS_KEY)) || [],
    currentUser: localStorage.getItem(SESSION_KEY),
    theme: localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light',

    library: loadLibrary(localStorage.getItem(SESSION_KEY)),
  },

  getters: {
    libraryCount: (state) => state.library.length,
    getFilm: (state) => (id) => state.library.find((film) => film.id === id),
    favorites: (state) => state.library.filter((film) => film.favorite),
    toWatch: (state) => state.library.filter((film) => film.status === 'toWatch'),
    watched: (state) => state.library.filter((film) => film.status === 'watched'),
  },

  mutations: {
    addFilm(state, film) {
      state.library.push(film)
      saveLibrary(state)
    },
    removeFilm(state, id) {
      state.library = state.library.filter((film) => film.id !== id)
      saveLibrary(state)
    },
    setStatus(state, { id, status }) {
      state.library.find((film) => film.id === id).status = status
      saveLibrary(state)
    },
    toggleFavorite(state, id) {
      const film = state.library.find((film) => film.id === id)
      film.favorite = !film.favorite
      saveLibrary(state)
    },

    addUser(state, user) {
      state.users.push(user)
      localStorage.setItem(USERS_KEY, JSON.stringify(state.users))
    },
    setCurrentUser(state, username) {
      state.currentUser = username
      state.library = loadLibrary(username)
      if (username) localStorage.setItem(SESSION_KEY, username)
      else localStorage.removeItem(SESSION_KEY)
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, state.theme)
    },
  },

  actions: {
    async register({ state, commit }, { username, password }) {
      if (state.users.some((u) => u.username === username)) {
        throw new Error('Ce nom d’utilisateur est déjà pris.')
      }
      commit('addUser', { username, password: await hash(password) })
      commit('setCurrentUser', username)
    },

    async login({ state, commit }, { username, password }) {
      const user = state.users.find((u) => u.username === username)
      if (!user || user.password !== (await hash(password))) {
        throw new Error('Identifiants incorrects.')
      }
      commit('setCurrentUser', username)
    },

    logout({ commit }) {
      commit('setCurrentUser', null)
    },

    toggleTheme({ commit }) {
      commit('toggleTheme')
    },

    setFilmStatus({ getters, commit }, { film, status }) {
      if (getters.getFilm(film.id)) {
        commit('setStatus', { id: film.id, status })
      } else {
        const { id, title, year, poster, director } = film
        commit('addFilm', { id, title, year, poster, director, status, favorite: false })
      }
    },

    removeFilm({ commit }, id) {
      commit('removeFilm', id)
    },

    toggleFavorite({ getters, dispatch, commit }, film) {
      if (!getters.getFilm(film.id)) {
        dispatch('setFilmStatus', { film, status: 'toWatch' })
      }
      commit('toggleFavorite', film.id)
    },
  },
})
