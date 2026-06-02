import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlay, FaPlus, FaTimes, FaStar } from 'react-icons/fa'
import { IMAGE_BASE_URL, fetchMovieDetails, fetchTvDetails } from '../api/tmdb'

function MovieModal({ movie, onClose }) {
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)
  const [visible, setVisible] = useState(false)

  // 진입 애니메이션
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // 상세 정보 fetch (장르, 런타임 등)
  useEffect(() => {
    const isTV = Boolean(movie.name || movie.first_air_date)
    const fetcher = isTV ? fetchTvDetails : fetchMovieDetails
    fetcher(movie.id)
      .then(setDetails)
      .catch(() => {})
  }, [movie.id])

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  const mediaType = movie.media_type ?? (movie.title ? 'movie' : 'tv')

  const handlePlay = () => {
    onClose()
    navigate(`/watch/${mediaType}/${movie.id}`, { state: { title: movie.title ?? movie.name ?? '', movie } })
  }

  const d = details ?? movie
  const title = d.title ?? d.name ?? ''
  const overview = d.overview || '줄거리 정보가 없습니다.'
  const backdrop = d.backdrop_path
    ? `${IMAGE_BASE_URL}/original${d.backdrop_path}`
    : null
  const rating = d.vote_average?.toFixed(1)
  const year = (d.release_date ?? d.first_air_date ?? '').slice(0, 4)
  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}시간 ${details.runtime % 60}분`
    : details?.episode_run_time?.[0]
      ? `회당 ${details.episode_run_time[0]}분`
      : null
  const genres = (details?.genres ?? []).map((g) => g.name).join(' · ')

  return (
    /* 오버레이 */
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-250 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={handleClose}
    >
      {/* 모달 카드 */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#181818] shadow-2xl transition-all duration-250 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ scrollbarWidth: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* X 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-[#181818] rounded-full p-2 text-white hover:bg-gray-700 transition-colors shadow-lg"
          aria-label="닫기"
        >
          <FaTimes className="text-lg" />
        </button>

        {/* 배경 이미지 + 그라디언트 */}
        <div className="relative w-full aspect-video bg-gray-900">
          {backdrop ? (
            <img
              src={backdrop}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}
          {/* 하단 페이드 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

          {/* 이미지 위 제목 + 버튼 */}
          <div className="absolute bottom-6 left-6 right-12">
            <h2 className="text-white text-2xl md:text-3xl font-extrabold mb-4 drop-shadow-lg">
              {title}
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                <FaPlay className="text-xs" />
                재생
              </button>
              <button className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-gray-400 text-white hover:border-white transition-colors">
                <FaPlus className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* 본문 영역 */}
        <div className="px-6 pb-8 pt-2">
          {/* 메타 정보 행 */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            {rating && (
              <span className="flex items-center gap-1 text-green-400 font-semibold">
                <FaStar className="text-yellow-400 text-xs" />
                {rating}
                <span className="text-gray-400 font-normal">/ 10</span>
              </span>
            )}
            {year && <span className="text-gray-300">{year}</span>}
            {runtime && (
              <span className="border border-gray-500 text-gray-300 px-1.5 py-0.5 text-xs rounded">
                {runtime}
              </span>
            )}
            {genres && <span className="text-gray-400">{genres}</span>}
          </div>

          {/* 줄거리 */}
          <p className="text-gray-200 text-sm md:text-base leading-relaxed">
            {overview}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MovieModal
