import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { obtenerTodasCategorias } from '@/features/categories/api/categoriasApi'
import {
  actualizarProducto, actualizarStock, crearProducto, eliminarProducto, obtenerProductosPaginados,
} from '@/features/products/api/productosApi'
import type { ProductoCreate, ProductoDatos, ProductoStock } from '@/features/products/types/producto'
import { useNotificationStore } from '@/store/notificationStore'

export type GuardarProducto =
  | { tipo: 'crear'; datos: ProductoCreate }
  | { tipo: 'editar'; id: number; datos: ProductoDatos }
  | { tipo: 'stock'; id: number; datos: ProductoStock }

async function obtenerProductosAdmin(signal: AbortSignal) {
  const limit = 100
  const primera = await obtenerProductosPaginados({ skip: 0, limit }, signal)
  const items = primera.items
  for (let skip = limit; skip < primera.total; skip += limit) {
    const pagina = await obtenerProductosPaginados({ skip, limit }, signal)
    items.push(...pagina.items)
  }
  return items
}

export function useProducts() {
  const queryClient = useQueryClient()
  const notificar = useNotificationStore((state) => state.showNotification)
  const productosQuery = useQuery({
    queryKey: ['productos', 'admin'],
    queryFn: ({ signal }) => obtenerProductosAdmin(signal),
  })
  const categoriasQuery = useQuery({
    queryKey: ['categorias'],
    queryFn: obtenerTodasCategorias,
  })

  const guardarMutation = useMutation({
    mutationFn: (cambio: GuardarProducto) => {
      if (cambio.tipo === 'crear') return crearProducto(cambio.datos)
      if (cambio.tipo === 'stock') return actualizarStock(cambio.id, cambio.datos)
      return actualizarProducto(cambio.id, cambio.datos)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
      notificar('Producto guardado')
    },
  })

  const eliminarMutation = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
      notificar('Producto dado de baja')
    },
  })

  return { productosQuery, categoriasQuery, guardarMutation, eliminarMutation }
}
