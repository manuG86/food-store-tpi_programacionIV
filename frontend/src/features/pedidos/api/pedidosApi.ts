import type { EstadoPedido, Pedido, PedidoCreate, PedidosPaginados, ResumenPedidos } from '@/features/pedidos/types/pedido'
import { api } from '@/shared/api/api'
import { obtenerMensajeError } from '@/shared/api/errores'

export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  try {
    return (await api.post<Pedido>('/pedidos', datos)).data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudo confirmar el pedido'), { cause: error })
  }
}

export async function obtenerMisPedidos(
  skip: number, limit: number, signal?: AbortSignal,
): Promise<PedidosPaginados> {
  try {
    const { data } = await api.get<PedidosPaginados>('/pedidos', {
      params: { skip, limit, propios: true }, signal,
    })
    return data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudieron cargar tus pedidos'), { cause: error })
  }
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  try {
    return (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudo cancelar el pedido'), { cause: error })
  }
}

export async function obtenerPedidosAdmin(
  params: { skip: number; limit: number; estado?: EstadoPedido },
  signal?: AbortSignal,
): Promise<PedidosPaginados> {
  try {
    return (await api.get<PedidosPaginados>('/pedidos', { params, signal })).data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudieron cargar los pedidos'), { cause: error })
  }
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  try {
    return (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudo cambiar el estado del pedido'), { cause: error })
  }
}

export async function obtenerResumenPedidos(signal?: AbortSignal): Promise<ResumenPedidos> {
  try {
    return (await api.get<ResumenPedidos>('/pedidos/resumen', { signal })).data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudo cargar el resumen'), { cause: error })
  }
}
