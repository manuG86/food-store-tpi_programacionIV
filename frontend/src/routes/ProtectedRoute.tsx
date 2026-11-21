import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/features/auth'
import type { RolUsuario } from '@/features/auth/types/auth.types'


interface ProtectedRouteProps {
  allowedRoles?: RolUsuario[]
}


function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user)
  const isChecking = useAuthStore((state) => state.isChecking)
  const location = useLocation()

  if (isChecking) {
    return <p className="p-8 text-center text-slate-600 dark:text-slate-300">Restaurando sesión...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
