import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { loggedIn, profile, loading } = useAuth()

  // Firebase가 이전 로그인 세션을 복원하는 동안 빈 화면 유지
  // (로딩 중 /login으로 잘못 리다이렉트되는 것을 방지)
  if (loading)   return null
  if (!loggedIn) return <Navigate to="/login"    replace />
  if (!profile)  return <Navigate to="/profiles" replace />
  return children
}

export default ProtectedRoute
