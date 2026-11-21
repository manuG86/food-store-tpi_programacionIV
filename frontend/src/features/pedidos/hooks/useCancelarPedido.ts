import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidarConsultasPedido } from '@/features/pedidos/hooks/invalidarConsultasPedido'
import { cancelarPedido } from '@/features/pedidos/api/pedidosApi'

export function useCancelarPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => invalidarConsultasPedido(queryClient, true),
  })
}
