import { createRouter, createWebHistory } from 'vue-router'
import RechercheView from '../views/RechercheView.vue'
import ResultatsView from '../views/ResultatsView.vue'
import DetailView from '../views/DetailView.vue'
import BibliothequeView from '../views/BibliothequeView.vue'
import ConnexionView from '../views/ConnexionView.vue'

const routes = [
  { path: '/', name: 'recherche', component: RechercheView },
  { path: '/resultats', name: 'resultats', component: ResultatsView },
  { path: '/detail/:id?', name: 'detail', component: DetailView },
  { path: '/library', name: 'bibliotheque', component: BibliothequeView },
  { path: '/favorites', name: 'favoris', component: BibliothequeView },
  { path: '/connexion', name: 'connexion', component: ConnexionView },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
