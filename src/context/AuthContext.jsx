import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const PROFILES = [
  { name: '기본 프로필', color: '#e50914', initial: 'P' },
  { name: '키즈',        color: '#2563eb', initial: 'K' },
  { name: '게스트',      color: '#7c3aed', initial: 'G' },
]

const USERS_KEY   = 'jmtv_users'
const SESSION_KEY = 'jmtv_session'
const PROFILE_KEY = 'jmtv_profile'
const histKey     = (email, profileName) => `jmtv_hist_${email}_${profileName}`

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
  })
  const [profile, setProfile] = useState(
    () => localStorage.getItem(PROFILE_KEY)
  )
  const [watchHistory, setWatchHistory] = useState([])

  const loggedIn = !!user

  // 프로필/유저 바뀔 때 해당 프로필의 시청 기록 로드
  useEffect(() => {
    if (!user?.email || !profile) { setWatchHistory([]); return }
    try {
      setWatchHistory(
        JSON.parse(localStorage.getItem(histKey(user.email, profile))) ?? []
      )
    } catch {
      setWatchHistory([])
    }
  }, [user?.email, profile])

  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) ?? {} } catch { return {} }
  }

  const signup = (email, password) => {
    const users = getUsers()
    if (users[email]) return { ok: false, message: '이미 가입된 이메일입니다.' }
    users[email] = { email, password }
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    const session = { email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return { ok: true }
  }

  const login = (email, password) => {
    const users = getUsers()
    if (!users[email]) return { ok: false, message: '등록되지 않은 이메일입니다.' }
    if (users[email].password !== password) return { ok: false, message: '비밀번호가 올바르지 않습니다.' }
    const session = { email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return { ok: true }
  }

  const selectProfile = (name) => {
    localStorage.setItem(PROFILE_KEY, name)
    setProfile(name)
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(PROFILE_KEY)
    setUser(null)
    setProfile(null)
    setWatchHistory([])
  }

  // 시청 기록 추가 (중복 시 최신순 업데이트, 최대 50개)
  const addToHistory = (item) => {
    if (!user?.email || !profile) return
    const key = histKey(user.email, profile)
    setWatchHistory(prev => {
      const filtered = prev.filter(
        h => !(h.id === item.id && h.mediaType === item.mediaType)
      )
      const updated = [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, 50)
      localStorage.setItem(key, JSON.stringify(updated))
      return updated
    })
  }

  // 시청 기록에서 상위 2개 선호 장르 ID 추출
  const getTopGenres = () => {
    const counts = {}
    watchHistory.forEach(item => {
      ;(item.genre_ids ?? []).forEach(gid => {
        counts[gid] = (counts[gid] ?? 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([gid]) => Number(gid))
  }

  return (
    <AuthContext.Provider
      value={{
        user, loggedIn, profile,
        watchHistory, addToHistory, getTopGenres,
        signup, login, selectProfile, logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
