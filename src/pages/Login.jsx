import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchTrending, IMAGE_BASE_URL } from '../api/tmdb'

const FALLBACK_BG =
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80'

function Login() {
  const navigate = useNavigate()
  const { login, signup, loggedIn, profile, loading } = useAuth()

  const [mode,       setMode]       = useState('login') // 'login' | 'signup'
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [error,      setError]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bgUrl,      setBgUrl]      = useState(FALLBACK_BG)

  useEffect(() => {
    if (loading) return // Firebase 초기화 완료 전에는 리다이렉트 안 함
    if (loggedIn && profile) { navigate('/', { replace: true }); return }
    if (loggedIn)            { navigate('/profiles', { replace: true }); return }
  }, [loggedIn, profile, loading, navigate])

  useEffect(() => {
    fetchTrending()
      .then((data) => {
        const withBg = (data.results ?? []).filter((m) => m.backdrop_path)
        const pick   = withBg[Math.floor(Math.random() * withBg.length)]
        if (pick) setBgUrl(`${IMAGE_BASE_URL}/original${pick.backdrop_path}`)
      })
      .catch(() => {})
  }, [])

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setPassword('')
    setConfirm('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          setError('비밀번호는 6자 이상이어야 합니다.')
          return
        }
        if (password !== confirm) {
          setError('비밀번호가 일치하지 않습니다.')
          return
        }
        const result = await signup(email.trim(), password)
        if (!result.ok) { setError(result.message); return }
      } else {
        const result = await login(email.trim(), password)
        if (!result.ok) { setError(result.message); return }
      }
      navigate('/profiles')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* 배경 이미지 */}
      <img
        src={bgUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* 상단 로고 */}
      <div className="absolute top-6 left-8">
        <span className="text-red-600 font-extrabold text-2xl tracking-tight select-none">
          JUSTMADETV
        </span>
      </div>

      {/* 카드 */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-black/80 backdrop-blur-sm rounded-lg px-10 py-12 shadow-2xl">

        {/* 탭 */}
        <div className="flex mb-8 border-b border-gray-700">
          {[
            { key: 'login',  label: '로그인' },
            { key: 'signup', label: '회원가입' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => switchMode(key)}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                mode === key
                  ? 'text-white border-b-2 border-red-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#333] text-white rounded px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#333] text-white rounded px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {mode === 'signup' && (
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-[#333] text-white rounded px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          )}

          {error && (
            <p className="text-red-400 text-xs leading-relaxed">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition-colors mt-2"
          >
            {submitting
              ? (mode === 'login' ? '로그인 중...' : '가입 중...')
              : (mode === 'login' ? '로그인' : '회원가입')
            }
          </button>
        </form>

        {mode === 'login' && (
          <p className="mt-6 text-center text-gray-400 text-sm">
            처음이신가요?{' '}
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="text-white hover:underline font-semibold"
            >
              JUSTMADETV 가입하기
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login
