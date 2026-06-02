import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { loggedIn, profile } = useAuth()
  if (!loggedIn)  return <Navigate to="/login"    replace />
  if (!profile)   return <Navigate to="/profiles" replace />
  return children
}

export default ProtectedRoute
