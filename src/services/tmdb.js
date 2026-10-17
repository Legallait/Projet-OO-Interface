const API_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_API_KEY_TMDB
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500'
const BACKDROP_URL = 'https://image.tmdb.org/t/p/w1280'
const PROFILE_URL = 'https://image.tmdb.org/t/p/w185'

export const GENRES = [
  { id: 18, label: 'Drame' },
  { id: 80, label: 'Policier' },
  { id: 35, label: 'Comédie' },
  { id: 12, label: 'Aventure' },
  { id: 878, label: 'Science-Fiction' },
  { id: 10749, label: 'Romance' },
]

async function request(path, params = {}) {
  const url = new URL(API_URL + path)
  url.search = new URLSearchParams({ api_key: API_KEY, language: 'fr-FR', ...params })

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Erreur de l'API TMDB (${response.status})`)
  }
  return response.json()
}

function toFilm(movie) {
  return {
    id: movie.id,
    title: movie.title,
    year: movie.release_date?.slice(0, 4) || '',
    poster: movie.poster_path ? IMAGE_URL + movie.poster_path : null,
  }
}

// Une page de résultats TMDB (20 films) + le nombre total de pages
function toPage(data) {
  return { films: data.results.map(toFilm), totalPages: data.total_pages }
}

export async function searchFilms(query, page = 1) {
  return toPage(await request('/search/movie', { query, page }))
}

export async function discoverByGenre(genreId, page = 1) {
  return toPage(await request('/discover/movie', { with_genres: genreId, sort_by: 'popularity.desc', page }))
}

export async function withDirectors(films) {
  return Promise.all(
    films.map(async (film) => {
      const credits = await request(`/movie/${film.id}/credits`).catch(() => null)
      const director = credits?.crew.find((person) => person.job === 'Director')?.name || 'Inconnu'
      return { ...film, director }
    }),
  )
}

export async function getFilm(id) {
  const movie = await request(`/movie/${id}`, { append_to_response: 'credits' })
  return {
    ...toFilm(movie),
    overview: movie.overview,
    genres: movie.genres.map((g) => g.name),
    runtime: movie.runtime,
    countries: movie.production_countries.map((c) => c.name).join(', '),
    director: movie.credits.crew.find((person) => person.job === 'Director')?.name || 'Inconnu',
    backdrop: movie.backdrop_path ? BACKDROP_URL + movie.backdrop_path : null,
    rating: movie.vote_average,
    votes: movie.vote_count,
    cast: movie.credits.cast.slice(0, 8).map((person) => ({
      id: person.id,
      name: person.name,
      character: person.character,
      photo: person.profile_path ? PROFILE_URL + person.profile_path : null,
    })),
  }
}

export async function getRecommendations(id) {
  const data = await request(`/movie/${id}/recommendations`)
  return data.results.map(toFilm)
}
