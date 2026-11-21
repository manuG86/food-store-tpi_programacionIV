import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useNotificationStore } from '@/store/notificationStore'

import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  obtenerTodasCategorias,
} from '@/features/categories/api/categoriasApi'
import type { CategoriaFormData } from '@/features/categories/types/categoria'

export function useCategories() {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((state) => state.showNotification)
  const categoriasQuery = useQuery({
    queryKey: ['categorias'],
    queryFn: obtenerTodasCategorias,
  })

  const crearMutation = useMutation({
    mutationFn: crearCategoria,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categorias'] })
      showNotification('Categoría creada')
    },
  })

  const actualizarMutation = useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: number
      datos: CategoriaFormData
    }) => actualizarCategoria(id, datos),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categorias'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
      ])
      showNotification('Categoría actualizada')
    },
  })

  const eliminarMutation = useMutation({
    mutationFn: eliminarCategoria,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categorias'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
      ])
      showNotification('Categoría eliminada')
    },
  })

  return { categoriasQuery, crearMutation, actualizarMutation, eliminarMutation }
}
