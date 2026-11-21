import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { cambiarEstadoUsuario, obtenerUsuariosAdmin } from '@/features/auth/api/authApi'


export function useAdminUsers() {
  const showNotification = useNotificationStore((state) => state.showNotification)
  const queryClient = useQueryClient()
  const usuarioId = useAuthStore(({ user }) => user?.id)
  const usuariosQuery = useQuery({
    queryKey: ['admin', 'usuarios', usuarioId],
    queryFn: obtenerUsuariosAdmin,
  })
  const estadoMutation = useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      cambiarEstadoUsuario(id, activar),
    onSuccess: async (_, { activar }) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] })
      showNotification(activar ? 'Usuario activado' : 'Usuario desactivado')
    },
  })

  return { usuariosQuery, estadoMutation }
}
