import { useState, useEffect } from 'react'

function useMovies(fetchFn) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchFn()
      .then((data) => {
        if (!cancelled) setMovies(data.results ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  // fetchFn 참조가 매 렌더마다 바뀌지 않도록 의존성에서 제외
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { movies, loading, error }
}

export default useMovies
