const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

const get = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('language', 'ko-KR')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${endpoint}`)
  return res.json()
}

// 카테고리별 fetch 함수
export const fetchNetflixOriginals = () =>
  get('/discover/tv', { with_networks: 213 })

export const fetchTrending = () =>
  get('/trending/all/week')

export const fetchTopRated = () =>
  get('/movie/top_rated')

export const fetchActionMovies = () =>
  get('/discover/movie', { with_genres: 28 })

export const fetchComedyMovies = () =>
  get('/discover/movie', { with_genres: 35 })

export const fetchHorrorMovies = () =>
  get('/discover/movie', { with_genres: 27 })

export const fetchRomanceMovies = () =>
  get('/discover/movie', { with_genres: 10749 })

export const fetchDocumentaries = () =>
  get('/discover/movie', { with_genres: 99 })

export const fetchKoreanContent = () =>
  get('/discover/tv', { with_original_language: 'ko', sort_by: 'popularity.desc' })

export const fetchMovieDetails = (id) => get(`/movie/${id}`)
export const fetchTvDetails = (id) => get(`/tv/${id}`)

export const fetchMovieVideos = (id) => get(`/movie/${id}/videos`)
export const fetchTvVideos   = (id) => get(`/tv/${id}/videos`)

export const searchMulti = (query) =>
  get('/search/multi', { query, include_adult: false })

export const fetchByGenres = (genreIds) =>
  get('/discover/movie', {
    with_genres: genreIds,
    sort_by: 'popularity.desc',
    'vote_count.gte': 100,
  })
