import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')

      if (accessToken) {
        try {
          const response = await fetch(`${API_URL}/api/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            localStorage.setItem('token', accessToken)
            localStorage.setItem('user', JSON.stringify(userData.user))
            navigate('/')
          } else {
            navigate('/login')
          }
        } catch (error) {
          console.error('Error en callback:', error)
          navigate('/login')
        }
      } else {
        const errorDescription = new URLSearchParams(window.location.search).get('error_description')
        if (errorDescription) {
          alert(errorDescription)
        }
        navigate('/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
        <p style={{ color: 'var(--color-on-surface)' }}>Verificando...</p>
      </div>
    </div>
  )
}