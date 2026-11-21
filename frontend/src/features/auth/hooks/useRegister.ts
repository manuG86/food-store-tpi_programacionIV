import { useMutation } from '@tanstack/react-query'

import { registrarUsuario } from '@/features/auth/api/authApi'
import { useNotificationStore } from '@/store/notificationStore'

export function useRegister() {
  const showNotification = useNotificationStore((state) => state.showNotification)

  return useMutation({
    mutationFn: registrarUsuario,
    onSuccess: () => showNotification('Cuenta creada correctamente'),
  })
}
