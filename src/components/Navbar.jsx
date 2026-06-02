import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { label: '홈',           to: '/' },
  { label: '시리즈',       to: '/series' },
  { label: '영화',         to: '/movies' },
  { label: '내가 찜한 콘텐츠', to: '/my-list' },
]

function Navbar() {
  const [scrolled,      setScrolled]      = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [query,         setQuery]         = useState('')
  const [showUserMenu,  setShowUserMenu]  = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { loggedIn, profile, logout } = useAuth()
  const inputRef   = useRef(null)
  const menuRef    = useRef(null)

  // 스크롤 감지
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 검색창 열리면 포커스
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  // 유저 메뉴 외부 클릭 닫기
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const openSearch = () => setSearchOpen(true)

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { closeSearch(); return }
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      closeSearch()
    }
  }

  const handleLogout = () => {
    setShowUserMenu(false)
    logout()
    navigate('/login')
  }

  const profileInitial = profile ? profile[0].toUpperCase() : 'J'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center px-4 md:px-16 py-4 transition-all duration-500 ${
        scrolled ? 'bg-[#141414]' : 'bg-transparent'
      }`}
      style={{
        backgroundImage: scrolled
          ? 'none'
          : 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
      }}
    >
      {/* 로고 */}
      <Link to="/" className="flex-shrink-0 mr-8">
        <span className="text-red-600 font-extrabold text-2xl tracking-tight select-none">
          JUSTMADETV
        </span>
      </Link>

      {/* 메뉴 */}
      <ul className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map(({ label, to }) => (
          <li key={to}>
            <Link
              to={to}
              className={`text-sm transition-colors duration-200 hover:text-white ${
                location.pathname === to
                  ? 'text-white font-semibold'
                  : 'text-gray-300'
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* 우측 영역 */}
      <div className="ml-auto flex items-center gap-3">

        {/* ── 검색 영역 ── */}
        <div className="flex items-center">
          {/* 검색창 (슬라이드 확장) */}
          <div
            className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out border border-white/70 bg-black/80 rounded ${
              searchOpen ? 'w-44 md:w-56 opacity-100 px-2' : 'w-0 opacity-0 px-0 border-transparent'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="제목, 장르, 배우..."
              className="bg-transparent text-white text-sm placeholder-gray-400 focus:outline-none ml-2 w-full py-1.5"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-white flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* 돋보기 아이콘 버튼 */}
          <button
            onClick={searchOpen ? closeSearch : openSearch}
            className="text-white hover:text-gray-300 transition-colors p-1 ml-1"
            aria-label="검색"
          >
            {searchOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* 알림 아이콘 */}
        <button className="text-white hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* ── 로그인 상태에 따른 우측 영역 ── */}
        {loggedIn ? (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="w-8 h-8 rounded bg-red-600 flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="프로필 메뉴"
            >
              <span className="text-white text-xs font-bold">{profileInitial}</span>
            </button>

            {/* 드롭다운 */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1a1a] border border-gray-700 rounded shadow-2xl py-1 z-50">
                {profile && (
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-white text-sm font-semibold truncate">{profile}</p>
                    <p className="text-gray-500 text-xs">현재 프로필</p>
                  </div>
                )}
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/profiles') }}
                  className="w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  프로필 전환
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
          >
            로그인
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
