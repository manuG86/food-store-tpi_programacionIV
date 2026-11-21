import { api } from '@/shared/api/api'
import { obtenerMensajeError } from '@/shared/api/errores'
import type { Categoria, CategoriaFormData, CategoriaListResponse } from '@/features/categories/types/categoria'

export async function crearCategoria(datos: CategoriaFormData): Promise<Categoria> {
  try {
    return (await api.post<Categoria>('/categorias', datos)).data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudo crear la categoría'), { cause: error })
  }
}

export async function actualizarCategoria(id: number, datos: CategoriaFormData): Promise<Categoria> {
  try {
    return (await api.put<Categoria>(`/categorias/${id}`, datos)).data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudo actualizar la categoría'), { cause: error })
  }
}

export async function eliminarCategoria(id: number): Promise<void> {
  try { await api.delete(`/categorias/${id}`) }
  catch (error) { throw new Error(await obtenerMensajeError(error, 'No se pudo eliminar la categoría'), { cause: error }) }
}

export async function obtenerTodasCategorias(): Promise<CategoriaListResponse> {
  try {
    const { data: items } = await api.get<Categoria[]>('/categorias')
    return { total: items.length, items }
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudieron obtener las categorías'), { cause: error })
  }
}
