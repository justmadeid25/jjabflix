import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaChevronLeft, FaChevronRight, FaPlay, FaInfoCircle } from 'react-icons/fa'
import useMovies from '../hooks/useMovies'
import { IMAGE_BASE_URL } from '../api/tmdb'
import { useModal } from '../context/ModalContext'

const POSTER_PLACEHOLDER = 'https://via.placeholder.com/200x300/1a1a1a/555?text=No+Image'
const NOOP_FETCH = () => Promise.resolve({ results: [] })

function MovieCard({ movie }) {
  const { openModal } = useModal()
  const navigate = useNavigate()

  const poster = movie.poster_path
    ? `${IMAGE_BASE_URL}/w342${movie.poster_path}`
    : POSTER_PLACEHOLDER
  const title = movie.title ?? movie.name ?? '제목 없음'
  const year = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4)
  const matchScore = movie.vote_average
    ? Math.min(Math.round(movie.vote_average * 10), 99)
    : null
  const mediaType = movie.media_type ?? (movie.title ? 'movie' : 'tv')

  const handlePlay = (e) => {
    e.stopPropagation()
    navigate(`/watch/${mediaType}/${movie.id}`, {
      state: { title: movie.title ?? movie.name ?? '', movie },
    })
  }

  const handleInfo = (e) => {
    e.stopPropagation()
    openModal(movie)
  }

  return (
    <div
      className="flex-shrink-0 w-36 md:w-44 cursor-pointer group/card"
      onClick={() => openModal(movie)}
    >
      <div className="relative overflow-hidden rounded-sm transition-transform duration-300 ease-in-out group-hover/card:scale-105 group-hover/card:shadow-[0_8px_32px_rgba(0,0,0,0.8)] group-hover/card:z-10">
        <img
          src={poster}
          alt={title}
          loading="lazy"
          className="w-full aspect-[2/3] object-cover"
          onError={(e) => { e.currentTarget.src = POSTER_PLACEHOLDER }}
        />

        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5">
          <p className="text-white text-[11px] font-bold line-clamp-2 leading-tight mb-1.5">
            {title}
          </p>

          <div className="flex items-center gap-1.5 mb-2">
            {matchScore && (
              <span className="text-green-400 text-[10px] font-semibold">
                {matchScore}% 일치
              </span>
            )}
            {year && (
              <span className="text-gray-400 text-[10px]">{year}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePlay}
              className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-gray-200 text-black text-[10px] font-bold py-1 rounded transition-colors"
            >
              <FaPlay className="text-[7px]" />
              재생
            </button>
            <button
              onClick={handleInfo}
              className="w-7 h-[22px] flex items-center justify-center rounded border border-gray-500 hover:border-white text-gray-300 hover:text-white transition-colors"
              title="상세 정보"
            >
              <FaInfoCircle className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MovieRowSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-36 md:w-44 aspect-[2/3] rounded-sm bg-gray-800 animate-pulse"
        />
      ))}
    </div>
  )
}

function MovieRow({ title, fetchFn, movies: moviesProp, loading: loadingProp }) {
  const effectiveFn = moviesProp != null ? NOOP_FETCH : (fetchFn ?? NOOP_FETCH)
  const { movies: fetchedMovies, loading: fetchLoading, error } = useMovies(effectiveFn)
  const movies  = moviesProp  ?? fetchedMovies
  const loading = loadingProp ?? (moviesProp != null ? false : fetchLoading)
  const rowRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd,   setAtEnd]   = useState(false)

  const handleScroll = () => {
    const el = rowRef.current
    if (!el) return
    setAtStart(el.scrollLeft < 10)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 10)
  }

  const scroll = (direction) => {
    rowRef.current?.scrollBy({ left: direction * 700, behavior: 'smooth' })
  }

  return (
    <section className="mb-8 group/row">
      <h2 className="text-white font-semibold text-lg md:text-xl px-4 md:px-16 mb-3">
        {title}
      </h2>

      <div className="relative px-4 md:px-16">
        {/* 왼쪽 화살표 */}
        {!atStart && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black text-white p-2 rounded-r h-full flex items-center transition-colors opacity-0 group-hover/row:opacity-100"
            aria-label="이전"
          >
            <FaChevronLeft className="text-lg" />
          </button>
        )}

        {loading ? (
          <MovieRowSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center h-28 text-gray-500 text-sm">
            API 키를 설정하면 데이터가 표시됩니다 &mdash;{' '}
            <code className="ml-1 text-gray-400">.env.local</code>
          </div>
        ) : (
          <div
            ref={rowRef}
            onScroll={handleScroll}
            className="flex gap-2 overflow-x-scroll scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {/* 오른쪽 화살표 */}
        {!atEnd && !loading && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black text-white p-2 rounded-l h-full flex items-center transition-colors opacity-0 group-hover/row:opacity-100"
            aria-label="다음"
          >
            <FaChevronRight className="text-lg" />
          </button>
        )}
      </div>
    </section>
  )
}

export default MovieRow
