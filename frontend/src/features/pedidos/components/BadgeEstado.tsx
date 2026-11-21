import type { EstadoPedido } from '@/features/pedidos/types/pedido'

const estados: Record<EstadoPedido, { nombre: string; color: string }> = {
  PENDIENTE: { nombre: 'Pendiente', color: 'bg-amber-100 text-amber-950' },
  EN_PREPARACION: { nombre: 'En preparación', color: 'bg-sky-100 text-sky-950' },
  ENTREGADO: { nombre: 'Entregado', color: 'bg-emerald-100 text-emerald-950' },
  CANCELADO: { nombre: 'Cancelado', color: 'bg-slate-200 text-slate-900' },
}

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { nombre, color } = estados[estado]
  return <span className={`rounded-full px-3 py-1 text-sm font-medium ${color}`}>{nombre}</span>
}
