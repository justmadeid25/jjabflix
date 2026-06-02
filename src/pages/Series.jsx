import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import MovieRow from '../components/MovieRow'
import { useAuth } from '../context/AuthContext'
import {
  fetchKoreanDramas,
  fetchTvAiringToday,
  fetchTvPopular,
  fetchNetflixOriginals,
  fetchKoreanVariety,
  fetchTvTopRated,
  fetchAnime,
  fetchCrimeSeries,
  fetchSciFiSeries,
} from '../api/tmdb'

const TV_ROWS = [
  { title: '지금 방영 중',               fetchFn: fetchTvAiringToday },
  { title: '인기 시리즈',                fetchFn: fetchTvPopular },
  { title: '한국 드라마',                fetchFn: fetchKoreanDramas },
  { title: 'JUSTMADETV 오리지널 시리즈', fetchFn: fetchNetflixOriginals },
  { title: '한국 예능',                  fetchFn: fetchKoreanVariety },
  { title: '높은 평점 시리즈',            fetchFn: fetchTvTopRated },
  { title: '애니메이션',                 fetchFn: fetchAnime },
  { title: '범죄 · 스릴러',              fetchFn: fetchCrimeSeries },
  { title: 'SF · 판타지',               fetchFn: fetchSciFiSeries },
]

function Series() {
  const { watchHistory } = useAuth()
  const [heroShow, setHeroShow] = useState(null)

  const tvHistory = watchHistory.filter(
    (m) => m.mediaType === 'tv' || m.media_type === 'tv'
  )

  useEffect(() => {
    fetchTvPopular()
      .then((data) => {
        const withBackdrop = (data.results ?? []).filter((s) => s.backdrop_path)
        const random = withBackdrop[Math.floor(Math.random() * withBackdrop.length)]
        setHeroShow(random ?? null)
      })
      .catch(() => setHeroShow(null))
  }, [])

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <HeroBanner movie={heroShow} />

      <div className="relative z-10 -mt-32 pb-16">
        {tvHistory.length > 0 && (
          <MovieRow title="시청 중인 시리즈" movies={tvHistory} />
        )}

        {TV_ROWS.map((row) => (
          <MovieRow key={row.title} title={row.title} fetchFn={row.fetchFn} />
        ))}
      </div>
    </div>
  )
}

export default Series
