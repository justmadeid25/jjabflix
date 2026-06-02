import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase'

const AuthContext = createContext(null)

export const PROFILES = [
  { name: '기본 프로필', color: '#e50914', initial: 'P' },
  { name: '키즈',        color: '#2563eb', initial: 'K' },
  { name: '게스트',      color: '#7c3aed', initial: 'G' },
]

// LocalStorage 키는 email 대신 Firebase uid 기반으로 관리
const profileKey = (uid) => `jmtv_profile_${uid}`
const histKey    = (uid, profileName) => `jmtv_hist_${uid}_${profileName}`

// Firebase 에러 코드 → 한국어 메시지
const FIREBASE_ERROR_MAP = {
  'auth/email-already-in-use':   '이미 가입된 이메일입니다.',
  'auth/invalid-email':          '유효하지 않은 이메일 형식입니다.',
  'auth/weak-password':          '비밀번호는 6자 이상이어야 합니다.',
  'auth/user-not-found':         '등록되지 않은 이메일입니다.',
  'auth/wrong-password':         '비밀번호가 올바르지 않습니다.',
  'auth/invalid-credential':     '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/too-many-requests':      '시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.',
  'auth/network-request-failed': '네트워크 오류가 발생했습니다. 연결을 확인해 주세요.',
}

const parseFirebaseError = (error) =>
  FIREBASE_ERROR_MAP[error.code] ?? `오류가 발생했습니다. (${error.code})`

export function AuthProvider({ children }) {
  // Firebase User 객체 (uid, email 등 포함). 비로그인 시 null.
  const [user,         setUser]         = useState(null)
  const [profile,      setProfile]      = useState(null)
  const [watchHistory, setWatchHistory] = useState([])
  // Firebase가 이전 로그인 상태를 복원하는 동안 true
  const [loading,      setLoading]      = useState(true)

  // Firebase 인증 상태 구독 — 앱 최초 로드 시 자동으로 세션 복원
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const saved = localStorage.getItem(profileKey(firebaseUser.uid))
        setProfile(saved)
      } else {
        setProfile(null)
        setWatchHistory([])
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // 프로필 또는 유저가 바뀔 때 해당 프로필의 시청 기록 로드
  useEffect(() => {
    if (!user?.uid || !profile) { setWatchHistory([]); return }
    try {
      setWatchHistory(
        JSON.parse(localStorage.getItem(histKey(user.uid, profile))) ?? []
      )
    } catch {
      setWatchHistory([])
    }
  }, [user?.uid, profile])

  // 회원가입 — Firebase createUserWithEmailAndPassword
  const signup = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      return { ok: true }
    } catch (error) {
      return { ok: false, message: parseFirebaseError(error) }
    }
  }

  // 로그인 — Firebase signInWithEmailAndPassword
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { ok: true }
    } catch (error) {
      return { ok: false, message: parseFirebaseError(error) }
    }
  }

  const selectProfile = (name) => {
    if (!user?.uid) return
    localStorage.setItem(profileKey(user.uid), name)
    setProfile(name)
  }

  const logout = async () => {
    // 즉시 상태를 초기화해서 UI가 바로 반응하도록
    const uid = user?.uid
    setUser(null)
    setProfile(null)
    setWatchHistory([])
    if (uid) localStorage.removeItem(profileKey(uid))
    await signOut(auth)
  }

  // 시청 기록 추가 (중복 시 최신순, 최대 50개)
  const addToHistory = (item) => {
    if (!user?.uid || !profile) return
    const key = histKey(user.uid, profile)
    setWatchHistory(prev => {
      const filtered = prev.filter(
        h => !(h.id === item.id && h.mediaType === item.mediaType)
      )
      const updated = [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, 50)
      localStorage.setItem(key, JSON.stringify(updated))
      return updated
    })
  }

  // 시청 기록 기반 상위 2개 선호 장르 ID 추출
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

  const loggedIn = !!user

  return (
    <AuthContext.Provider
      value={{
        user, loggedIn, profile, loading,
        watchHistory, addToHistory, getTopGenres,
        signup, login, selectProfile, logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
