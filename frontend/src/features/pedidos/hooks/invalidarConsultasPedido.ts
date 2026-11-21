import type { QueryClient } from '@tanstack/react-query'

export async function invalidarConsultasPedido(queryClient: QueryClient, cambioStock: boolean) {
  const invalidaciones = [queryClient.invalidateQueries({ queryKey: ['pedidos'] })]
  if (cambioStock) invalidaciones.push(queryClient.invalidateQueries({ queryKey: ['productos'] }))
  await Promise.all(invalidaciones)
}
