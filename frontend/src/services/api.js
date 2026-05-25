import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de request: agrega el token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skyship_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de response: maneja token expirado globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skyship_token')
      localStorage.removeItem('skyship_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api