import { useNavigate } from 'react-router-dom'
import { FaPlay, FaInfoCircle } from 'react-icons/fa'
import { IMAGE_BASE_URL } from '../api/tmdb'
import { useModal } from '../context/ModalContext'

const FALLBACK = {
  title: '오징어 게임 시즌 3',
  overview:
    '새벽이 다시 게임에 뛰어든다. 더 잔인해진 규칙, 더 많은 상금, 그리고 누구도 예상하지 못한 결말. 살아남을 자는 단 한 명뿐이다.',
  backdrop_path: null,
  fallbackBg: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=1920&q=80',
}

function HeroBanner({ movie }) {
  const navigate = useNavigate()
  const { openModal } = useModal()
  const data = movie ?? FALLBACK
  const title = data.title ?? data.name ?? FALLBACK.title
  const overview = data.overview || FALLBACK.overview
  const backdropUrl = data.backdrop_path
    ? `${IMAGE_BASE_URL}/original${data.backdrop_path}`
    : FALLBACK.fallbackBg

  return (
    <section className="relative w-full h-[85vh] md:h-screen overflow-hidden">
      {/* 배경 이미지 */}
      <img
        src={backdropUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

      {/* 콘텐츠 */}
      <div className="absolute bottom-[20%] md:bottom-[30%] left-4 md:left-16 max-w-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-red-500 font-bold text-sm tracking-widest uppercase">
            N 시리즈
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
          {title}
        </h1>

        <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
          {overview}
        </p>

        <div className="flex items-center gap-3 mb-6 text-sm text-gray-300">
          <span className="text-green-400 font-semibold">97% 일치</span>
          <span>{data.release_date?.slice(0, 4) ?? data.first_air_date?.slice(0, 4) ?? 2025}</span>
          <span className="border border-gray-400 px-1 text-xs">18+</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!movie) return
              const mediaType = movie.media_type ?? (movie.title ? 'movie' : 'tv')
              navigate(`/watch/${mediaType}/${movie.id}`, {
                state: { title: movie.title ?? movie.name ?? '', movie },
              })
            }}
            className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded hover:bg-gray-200 transition-colors text-sm md:text-base"
          >
            <FaPlay className="text-sm" />
            지금 시청하기
          </button>
          <button
            onClick={() => movie && openModal(movie)}
            className="flex items-center gap-2 bg-gray-500/70 text-white font-semibold px-6 py-2.5 rounded hover:bg-gray-500/90 transition-colors text-sm md:text-base backdrop-blur-sm"
          >
            <FaInfoCircle className="text-base" />
            상세 정보
          </button>
        </div>
      </div>

      {/* 연령 등급 */}
      <div className="absolute bottom-[28%] md:bottom-[35%] right-0 flex items-center border-l-4 border-gray-400 bg-black/50 px-4 py-1">
        <span className="text-gray-300 text-sm">18+</span>
      </div>
    </section>
  )
}

export default HeroBanner
