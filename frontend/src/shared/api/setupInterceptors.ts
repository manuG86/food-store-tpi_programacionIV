import axios from 'axios'

import { useAuthStore } from '@/features/auth/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { api } from './api'

const RUTAS_AUTH = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: unknown }>(error)) {
      const status = error.response?.status
      const url = error.config?.url ?? ''

      const cuentaDesactivada = status === 400 &&
        error.response?.data?.detail === 'Cuenta de usuario desactivada'

      if (cuentaDesactivada || (status === 401 && !RUTAS_AUTH.includes(url))) {
        useAuthStore.getState().clearSession()
      }
      if (status === 403) {
        useNotificationStore.getState().showNotification('Acceso denegado')
      }
    }
    return Promise.reject(error)
  },
)
