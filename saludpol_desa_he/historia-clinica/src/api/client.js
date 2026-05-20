import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const client = axios.create({
  // baseURL: '/api',
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?._skipAuthRedirect) {
      useAuthStore.getState().clearAuth()
      globalThis.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
