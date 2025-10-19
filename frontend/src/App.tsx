import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

function App() {
  const { token, user, setUser } = useAuthStore()

  // Initialize user from localStorage on app start
  useEffect(() => {
    if (token && !user) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error('Failed to parse stored user data')
        }
      }
    }
  }, [token, user, setUser])

  return null // App component is now just for initialization
}

export default App
