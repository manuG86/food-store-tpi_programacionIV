import { api } from '@/shared/api/api'
import { obtenerMensajeError } from '@/shared/api/errores'
import type {
  FiltrosProductos, ProductoCatalogo, ProductoCreate, ProductoDatos, ProductosPaginados, ProductoStock,
} from '@/features/products/types/producto'

export async function crearProducto(datos: ProductoCreate): Promise<ProductoCatalogo> {
  try { return (await api.post<ProductoCatalogo>('/productos', datos)).data }
  catch (error) { throw new Error(await obtenerMensajeError(error, 'No se pudo crear el producto'), { cause: error }) }
}

export async function actualizarProducto(id: number, datos: ProductoDatos): Promise<ProductoCatalogo> {
  try { return (await api.put<ProductoCatalogo>(`/productos/${id}`, datos)).data }
  catch (error) { throw new Error(await obtenerMensajeError(error, 'No se pudo actualizar el producto'), { cause: error }) }
}

export async function actualizarStock(id: number, datos: ProductoStock): Promise<ProductoCatalogo> {
  try { return (await api.patch<ProductoCatalogo>(`/productos/${id}/stock`, datos)).data }
  catch (error) { throw new Error(await obtenerMensajeError(error, 'No se pudo actualizar el stock'), { cause: error }) }
}

export async function eliminarProducto(id: number): Promise<void> {
  try { await api.delete(`/productos/${id}`) }
  catch (error) { throw new Error(await obtenerMensajeError(error, 'No se pudo eliminar el producto'), { cause: error }) }
}

export async function obtenerProductosPaginados(
  params: FiltrosProductos,
  signal?: AbortSignal,
): Promise<ProductosPaginados> {
  try {
    return (await api.get<ProductosPaginados>('/productos', { params, signal })).data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudieron obtener los productos'), { cause: error })
  }
}
