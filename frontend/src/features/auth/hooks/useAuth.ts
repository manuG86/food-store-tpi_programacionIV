import { useShallow } from 'zustand/react/shallow'

import { useAuthStore } from '@/features/auth/store/authStore'

export function useAuth() {
  return useAuthStore(useShallow(({ user, login, logout, isChecking, isSubmitting, error }) => ({
    user,
    login,
    logout,
    isChecking,
    isSubmitting,
    error,
  })))
}
