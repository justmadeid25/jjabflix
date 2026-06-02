import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import MovieRow from '../components/MovieRow'
import { useAuth } from '../context/AuthContext'
import {
  fetchMoviesPopular,
  fetchMoviesNowPlaying,
  fetchMoviesTopRated,
  fetchActionMovies,
  fetchComedyMovies,
  fetchHorrorMovies,
  fetchRomanceMovies,
  fetchDocumentaries,
} from '../api/tmdb'

const MOVIE_ROWS = [
  { title: '현재 상영 중',    fetchFn: fetchMoviesNowPlaying },
  { title: '인기 영화',       fetchFn: fetchMoviesPopular },
  { title: '높은 평점 영화',   fetchFn: fetchMoviesTopRated },
  { title: '액션 & 어드벤처', fetchFn: fetchActionMovies },
  { title: '코미디',          fetchFn: fetchComedyMovies },
  { title: '공포',            fetchFn: fetchHorrorMovies },
  { title: '로맨스',          fetchFn: fetchRomanceMovies },
  { title: '다큐멘터리',      fetchFn: fetchDocumentaries },
]

function Movies() {
  const { watchHistory } = useAuth()
  const [heroMovie, setHeroMovie] = useState(null)

  const movieHistory = watchHistory.filter(
    (m) => m.mediaType === 'movie' || m.media_type === 'movie'
  )

  useEffect(() => {
    fetchMoviesNowPlaying()
      .then((data) => {
        const withBackdrop = (data.results ?? []).filter((m) => m.backdrop_path)
        const random = withBackdrop[Math.floor(Math.random() * withBackdrop.length)]
        setHeroMovie(random ?? null)
      })
      .catch(() => setHeroMovie(null))
  }, [])

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <HeroBanner movie={heroMovie} />

      <div className="relative z-10 -mt-32 pb-16">
        {movieHistory.length > 0 && (
          <MovieRow title="시청 중인 영화" movies={movieHistory} />
        )}

        {MOVIE_ROWS.map((row) => (
          <MovieRow key={row.title} title={row.title} fetchFn={row.fetchFn} />
        ))}
      </div>
    </div>
  )
}

export default Movies
