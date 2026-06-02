import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { searchMulti, IMAGE_BASE_URL } from '../api/tmdb'
import { useModal } from '../context/ModalContext'

const PLACEHOLDER = 'https://via.placeholder.com/300x450/1a1a1a/555?text=No+Image'

function SearchCard({ movie }) {
  const { openModal } = useModal()
  const poster = movie.poster_path
    ? `${IMAGE_BASE_URL}/w342${movie.poster_path}`
    : PLACEHOLDER
  const title = movie.title ?? movie.name ?? '제목 없음'

  return (
    <div
      onClick={() => openModal(movie)}
      className="cursor-pointer group relative overflow-hidden rounded"
    >
      <img
        src={poster}
        alt={title}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER }}
        className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* 호버 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
        <p className="text-white text-xs font-semibold line-clamp-2">{title}</p>
        {movie.vote_average > 0 && (
          <p className="text-green-400 text-xs mt-1">
            ★ {movie.vote_average.toFixed(1)}
          </p>
        )}
      </div>
    </div>
  )
}

function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    if (!query.trim()) { setResults([]); setDone(false); return }
    setLoading(true)
    setDone(false)
    searchMulti(query)
      .then((data) => {
        // person 제외, poster 없는 항목 뒤로
        const filtered = (data.results ?? []).filter(
          (r) => r.media_type !== 'person',
        )
        setResults(filtered)
      })
      .catch(() => setResults([]))
      .finally(() => { setLoading(false); setDone(true) })
  }, [query])

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <div className="px-4 md:px-16 pt-28 pb-16">
        {/* 헤더 */}
        <div className="mb-6">
          {query ? (
            <p className="text-gray-300 text-sm md:text-base">
              <span className="text-white font-semibold">"{query}"</span>
              {' '}검색 결과
              {done && (
                <span className="ml-2 text-gray-500">
                  ({results.length}개)
                </span>
              )}
            </p>
          ) : (
            <p className="text-gray-400">검색어를 입력해 주세요.</p>
          )}
        </div>

        {/* 로딩 스켈레톤 */}
        {loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && done && results.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-2">검색 결과가 없습니다.</p>
            <p className="text-gray-600 text-sm">다른 검색어를 시도해 보세요.</p>
          </div>
        )}

        {/* 결과 그리드 */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {results.map((movie) => (
              <SearchCard key={`${movie.media_type}-${movie.id}`} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
