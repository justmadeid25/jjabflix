import { createContext, useContext, useState } from 'react'
import MovieModal from '../components/MovieModal'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [movie, setMovie] = useState(null)

  const openModal = (m) => setMovie(m)
  const closeModal = () => setMovie(null)

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {movie && <MovieModal movie={movie} onClose={closeModal} />}
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
