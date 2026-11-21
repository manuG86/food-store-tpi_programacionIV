import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidarConsultasPedido } from '@/features/pedidos/hooks/invalidarConsultasPedido'
import { crearPedido } from '@/features/pedidos/api/pedidosApi'

export function useCrearPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => invalidarConsultasPedido(queryClient, true),
  })
}
