import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PROFILES = [
  { name: '저스트',   color: 'bg-blue-600',   initial: 'J' },
  { name: '마데',     color: 'bg-red-600',     initial: 'M' },
  { name: '어린이',   color: 'bg-green-500',   initial: 'K' },
  { name: '게스트',   color: 'bg-purple-600',  initial: 'G' },
]

function ProfileSelect() {
  const navigate = useNavigate()
  const { selectProfile, loggedIn } = useAuth()

  // 비로그인 접근 차단은 ProtectedRoute가 아닌 여기서 직접 처리
  // (ProfileSelect는 loggedIn O, profile X 상태에서만 접근)

  const handleSelect = (name) => {
    selectProfile(name)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4">
      {/* 상단 로고 */}
      <span className="text-red-600 font-extrabold text-2xl tracking-tight mb-16">
        JUSTMADETV
      </span>

      <h1 className="text-white text-3xl md:text-4xl font-semibold mb-12 text-center">
        시청할 프로필을 선택하세요
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {PROFILES.map(({ name, color, initial }) => (
          <button
            key={name}
            onClick={() => handleSelect(name)}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            {/* 아바타 */}
            <div
              className={`w-28 h-28 md:w-36 md:h-36 rounded-lg ${color} flex items-center justify-center text-white text-5xl md:text-6xl font-bold
                transition-all duration-200
                opacity-70 group-hover:opacity-100
                ring-0 group-hover:ring-4 group-hover:ring-white
                scale-95 group-hover:scale-100`}
            >
              {initial}
            </div>
            {/* 이름 */}
            <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
              {name}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate('/login')}
        className="mt-16 flex items-center gap-2 border border-gray-500 text-gray-400 hover:text-white hover:border-white px-6 py-2 rounded transition-colors text-sm"
      >
        프로필 관리
      </button>
    </div>
  )
}

export default ProfileSelect
