import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import MovieRow from '../components/MovieRow'
import { useAuth } from '../context/AuthContext'
import {
  fetchNetflixOriginals,
  fetchTrending,
  fetchTopRated,
  fetchActionMovies,
  fetchComedyMovies,
  fetchHorrorMovies,
  fetchKoreanContent,
  fetchByGenres,
} from '../api/tmdb'

const ROWS = [
  { title: '지금 뜨는 콘텐츠',     fetchFn: fetchTrending },
  { title: 'JUSTMADETV 오리지널',   fetchFn: fetchNetflixOriginals },
  { title: '한국 콘텐츠',           fetchFn: fetchKoreanContent },
  { title: '높은 평점',             fetchFn: fetchTopRated },
  { title: '액션 & 어드벤처',       fetchFn: fetchActionMovies },
  { title: '코미디',                fetchFn: fetchComedyMovies },
  { title: '공포',                  fetchFn: fetchHorrorMovies },
]

function Home() {
  const { profile, watchHistory, getTopGenres } = useAuth()
  const [heroMovie,  setHeroMovie]  = useState(null)
  const [recMovies,  setRecMovies]  = useState([])
  const [recLoading, setRecLoading] = useState(false)

  // 상위 선호 장르 계산
  const topGenres    = getTopGenres()
  const topGenresKey = topGenres.join(',')

  // 히어로 배너용 랜덤 영화
  useEffect(() => {
    fetchNetflixOriginals()
      .then((data) => {
        const withBackdrop = (data.results ?? []).filter((m) => m.backdrop_path)
        const random = withBackdrop[Math.floor(Math.random() * withBackdrop.length)]
        setHeroMovie(random ?? null)
      })
      .catch(() => setHeroMovie(null))
  }, [])

  // 선호 장르 변경 시 추천 콘텐츠 fetch
  useEffect(() => {
    if (!topGenresKey) { setRecMovies([]); return }
    setRecLoading(true)
    fetchByGenres(topGenresKey)
      .then((data) => setRecMovies(data.results ?? []))
      .catch(() => setRecMovies([]))
      .finally(() => setRecLoading(false))
  }, [topGenresKey])

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <HeroBanner movie={heroMovie} />

      <div className="relative z-10 -mt-32 pb-16">

        {/* ── 시청 중인 콘텐츠 ── */}
        {watchHistory.length > 0 && (
          <MovieRow
            title="시청 중인 콘텐츠"
            movies={watchHistory}
          />
        )}

        {/* ── 취향 저격 추천 ── */}
        {topGenresKey && (
          <MovieRow
            key={`rec-${topGenresKey}`}
            title={`${profile}님을 위한 추천 콘텐츠`}
            movies={recLoading ? undefined : recMovies}
            loading={recLoading}
          />
        )}

        {/* ── 기본 카테고리 Rows ── */}
        {ROWS.map((row) => (
          <MovieRow key={row.title} title={row.title} fetchFn={row.fetchFn} />
        ))}

      </div>
    </div>
  )
}

export default Home
