import { useNavigate } from 'react-router-dom'
import { useAuth, PROFILES } from '../context/AuthContext'

function Profiles() {
  const navigate = useNavigate()
  const { selectProfile, profile: currentProfile } = useAuth()

  const handleSelect = (name) => {
    selectProfile(name)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4">
      {/* 로고 */}
      <span className="text-red-600 font-extrabold text-3xl tracking-tight mb-16 select-none">
        JUSTMADETV
      </span>

      <h1 className="text-white text-3xl md:text-5xl font-light mb-14 text-center tracking-tight">
        시청할 프로필을 선택하세요
      </h1>

      <div className="flex flex-wrap items-end justify-center gap-4 md:gap-8">
        {PROFILES.map(({ name, color, initial }) => (
          <button
            key={name}
            onClick={() => handleSelect(name)}
            className="group flex flex-col items-center gap-4 focus:outline-none"
          >
            <div
              className={`
                w-28 h-28 md:w-36 md:h-36 rounded-lg flex items-center justify-center
                text-white text-5xl font-bold select-none
                transition-all duration-200
                opacity-70 group-hover:opacity-100
                ring-0 group-hover:ring-4 group-hover:ring-white
                group-hover:scale-105
                ${currentProfile === name ? 'opacity-100 ring-4 ring-white' : ''}
              `}
              style={{ backgroundColor: color }}
            >
              {initial}
            </div>
            <span
              className={`text-sm md:text-base font-medium transition-colors
                ${currentProfile === name ? 'text-white' : 'text-gray-400 group-hover:text-white'}
              `}
            >
              {name}
            </span>
          </button>
        ))}

        {/* 프로필 추가 */}
        <button className="group flex flex-col items-center gap-4 focus:outline-none">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-600 text-5xl transition-all duration-200 group-hover:border-gray-300 group-hover:text-gray-300 group-hover:scale-105">
            +
          </div>
          <span className="text-gray-500 text-sm md:text-base font-medium group-hover:text-white transition-colors">
            프로필 추가
          </span>
        </button>
      </div>

      <button
        onClick={() => navigate('/login')}
        className="mt-20 border border-gray-600 text-gray-400 hover:text-white hover:border-white px-8 py-2 text-sm font-medium tracking-widest uppercase transition-colors"
      >
        프로필 관리
      </button>
    </div>
  )
}

export default Profiles
