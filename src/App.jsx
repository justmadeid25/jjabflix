import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ModalProvider } from './context/ModalContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home          from './pages/Home'
import Watch         from './pages/Watch'
import Search        from './pages/Search'
import Login         from './pages/Login'
import Profiles from './pages/Profiles'
import './index.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModalProvider>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/login"    element={<Login />} />
            <Route path="/profiles" element={<Profiles />} />

            {/* 보호된 라우트 */}
            <Route path="/" element={
              <ProtectedRoute><Home /></ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute><Search /></ProtectedRoute>
            } />
            <Route path="/watch/:mediaType/:id" element={
              <ProtectedRoute><Watch /></ProtectedRoute>
            } />

            {/* 없는 경로 → 로그인 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ModalProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
