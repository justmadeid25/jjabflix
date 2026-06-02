import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlay, FaPlus, FaTimes, FaStar } from 'react-icons/fa'
import { IMAGE_BASE_URL, fetchMovieDetails, fetchTvDetails, fetchTvSeason } from '../api/tmdb'

function MovieModal({ movie, onClose }) {
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)
  const [visible, setVisible] = useState(false)
  const [episodes, setEpisodes] = useState([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)

  const mediaType = movie.media_type ?? (movie.title ? 'movie' : 'tv')
  const isTV = mediaType === 'tv'

  // 진입 애니메이션
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // 상세 정보 fetch
  useEffect(() => {
    const fetcher = isTV ? fetchTvDetails : fetchMovieDetails
    fetcher(movie.id)
      .then(setDetails)
      .catch(() => {})
  }, [movie.id, isTV])

  // TV 시리즈인 경우 시즌 1 에피소드 fetch
  useEffect(() => {
    if (!isTV) return
    setLoadingEpisodes(true)
    fetchTvSeason(movie.id, 1)
      .then((data) => setEpisodes(data.episodes ?? []))
      .catch(() => setEpisodes([]))
      .finally(() => setLoadingEpisodes(false))
  }, [movie.id, isTV])

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

  const navigateToWatch = (season, episodeNumber, episodeTitle) => {
    onClose()
    navigate(`/watch/${mediaType}/${movie.id}`, {
      state: {
        title: isTV
          ? `${title}${episodeTitle ? ` - ${episodeTitle}` : ''}`
          : title,
        seriesTitle: title,
        movie,
        ...(isTV && { season, episode: episodeNumber, episodes }),
      },
    })
  }

  const handlePlay = () => {
    if (isTV && episodes.length > 0) {
      const ep = episodes[0]
      navigateToWatch(1, ep.episode_number, ep.name)
    } else {
      navigateToWatch(1, 1, null)
    }
  }

  const handlePlayEpisode = (ep) => {
    navigateToWatch(1, ep.episode_number, ep.name)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-250 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={handleClose}
    >
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
            <img src={backdrop} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

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
                {isTV ? '1화 재생' : '재생'}
              </button>
              <button className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-gray-400 text-white hover:border-white transition-colors">
                <FaPlus className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* 본문 영역 */}
        <div className="px-6 pb-6 pt-2">
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

          <p className="text-gray-200 text-sm md:text-base leading-relaxed">
            {overview}
          </p>
        </div>

        {/* 에피소드 목록 (TV 시리즈만) */}
        {isTV && (
          <>
            <div className="border-t border-gray-700 mx-6 mb-5" />
            <div className="px-6 pb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-white text-lg font-bold">에피소드</h3>
                {!loadingEpisodes && episodes.length > 0 && (
                  <span className="text-gray-400 text-sm">
                    시즌 1 &nbsp;·&nbsp; {episodes.length}개
                  </span>
                )}
              </div>

              {loadingEpisodes ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-32 aspect-video bg-gray-700 rounded flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-700 rounded w-full" />
                        <div className="h-3 bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : episodes.length === 0 ? (
                <p className="text-gray-500 text-sm">에피소드 정보를 불러올 수 없습니다.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => handlePlayEpisode(ep)}
                      className="flex items-start gap-4 p-3 rounded-md hover:bg-[#2a2a2a] transition-colors text-left w-full group"
                    >
                      {/* 썸네일 */}
                      <div className="relative flex-shrink-0 w-32 aspect-video bg-gray-800 rounded overflow-hidden">
                        {ep.still_path ? (
                          <img
                            src={`${IMAGE_BASE_URL}/w300${ep.still_path}`}
                            alt={ep.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaPlay className="text-gray-600 text-xl" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FaPlay className="text-white text-lg" />
                        </div>
                      </div>

                      {/* 에피소드 정보 */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-white font-semibold text-sm leading-snug">
                            {ep.episode_number}. {ep.name}
                          </span>
                          {ep.runtime && (
                            <span className="text-gray-500 text-xs flex-shrink-0">
                              {ep.runtime}분
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                          {ep.overview || '줄거리 정보 없음'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MovieModal
