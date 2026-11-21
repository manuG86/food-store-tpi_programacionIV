import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { cerrarSesion, iniciarSesion, obtenerSesion } from '@/features/auth/api/authApi'
import type { UsuarioAuth } from '@/features/auth/types/auth.types'

interface AuthState {
  user: UsuarioAuth | null
  isChecking: boolean
  isSubmitting: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
  clearSession: () => void
}

let comprobacionEnCurso: Promise<void> | undefined

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  user: null,
  isChecking: true,
  isSubmitting: false,
  error: null,

  login: async (username, password) => {
    set({ isSubmitting: true, error: null })
    try {
      await comprobacionEnCurso
      await iniciarSesion(username, password)
      const user = await obtenerSesion()
      set({ user })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo iniciar sesión'
      set({ user: null, error: mensaje })
      throw error
    } finally {
      set({ isSubmitting: false })
    }
  },

  checkAuth: () => {
    if (comprobacionEnCurso) return comprobacionEnCurso

    set({ isChecking: true })
    comprobacionEnCurso = obtenerSesion()
      .then((user) => { set({ user }) })
      .catch(() => { set({ user: null }) })
      .finally(() => {
        comprobacionEnCurso = undefined
        set({ isChecking: false })
      })
    return comprobacionEnCurso
  },

  logout: async () => {
    await cerrarSesion()
    get().clearSession()
  },

  clearSession: () => set({ user: null, error: null }),
}), {
  name: 'food-store-auth',
  partialize: ({ user }) => ({ user }),
}))
