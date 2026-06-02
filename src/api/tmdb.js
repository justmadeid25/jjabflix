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

// ── 홈 ──────────────────────────────────────────────────────────────────────
export const fetchNetflixOriginals = () =>
  get('/discover/tv', { with_networks: 213 })

export const fetchTrending = () =>
  get('/trending/all/week')

export const fetchKoreanContent = () =>
  get('/discover/tv', { with_original_language: 'ko', sort_by: 'popularity.desc' })

// ── 영화(Movie) ──────────────────────────────────────────────────────────────
export const fetchMoviesPopular = () => get('/movie/popular')
export const fetchMoviesNowPlaying = () => get('/movie/now_playing')
export const fetchTopRated = () => get('/movie/top_rated')          // 홈 호환 유지
export const fetchMoviesTopRated = () => get('/movie/top_rated')

export const fetchActionMovies = () =>
  get('/discover/movie', { with_genres: 28, sort_by: 'popularity.desc' })

export const fetchComedyMovies = () =>
  get('/discover/movie', { with_genres: 35, sort_by: 'popularity.desc' })

export const fetchHorrorMovies = () =>
  get('/discover/movie', { with_genres: 27, sort_by: 'popularity.desc' })

export const fetchRomanceMovies = () =>
  get('/discover/movie', { with_genres: 10749, sort_by: 'popularity.desc' })

export const fetchDocumentaries = () =>
  get('/discover/movie', { with_genres: 99, sort_by: 'popularity.desc' })

// ── 시리즈(TV) ───────────────────────────────────────────────────────────────
export const fetchTvPopular = () => get('/tv/popular')
export const fetchTvTopRated = () => get('/tv/top_rated')
export const fetchTvAiringToday = () => get('/tv/airing_today')

export const fetchKoreanDramas = () =>
  get('/discover/tv', {
    with_original_language: 'ko',
    with_genres: '18',
    sort_by: 'popularity.desc',
  })

export const fetchKoreanVariety = () =>
  get('/discover/tv', {
    with_original_language: 'ko',
    with_genres: '10764|10767|35',
    sort_by: 'popularity.desc',
  })

export const fetchAnime = () =>
  get('/discover/tv', {
    with_genres: '16',
    with_original_language: 'ja',
    sort_by: 'popularity.desc',
  })

export const fetchCrimeSeries = () =>
  get('/discover/tv', {
    with_genres: '80',
    sort_by: 'popularity.desc',
  })

export const fetchSciFiSeries = () =>
  get('/discover/tv', {
    with_genres: '10765',
    sort_by: 'popularity.desc',
  })

// ── 상세 정보 ────────────────────────────────────────────────────────────────
export const fetchMovieDetails = (id) => get(`/movie/${id}`)
export const fetchTvDetails = (id) => get(`/tv/${id}`)
export const fetchTvSeason = (id, season = 1) => get(`/tv/${id}/season/${season}`)

export const fetchMovieVideos = (id) => get(`/movie/${id}/videos`)
export const fetchTvVideos = (id) => get(`/tv/${id}/videos`)

// ── 검색 & 추천 ──────────────────────────────────────────────────────────────
export const searchMulti = (query) =>
  get('/search/multi', { query, include_adult: false })

export const fetchByGenres = (genreIds) =>
  get('/discover/movie', {
    with_genres: genreIds,
    sort_by: 'popularity.desc',
    'vote_count.gte': 100,
  })
