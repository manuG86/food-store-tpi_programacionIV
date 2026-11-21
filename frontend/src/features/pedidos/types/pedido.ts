export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

export interface PedidoCreate {
  items: { producto_id: number; cantidad: number }[]
  direccion_entrega: string
  forma_pago: FormaPago
  notas?: string
}

export interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export interface Pedido extends Omit<PedidoCreate, 'items' | 'notas'> {
  id: number
  usuario_id: number
  estado: EstadoPedido
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export interface PedidosPaginados {
  total: number
  items: Pedido[]
}

export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}
