import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/features/auth'
import { obtenerMisPedidos } from '@/features/pedidos/api/pedidosApi'
import { BadgeEstado } from '@/features/pedidos/components/BadgeEstado'
import { useCancelarPedido } from '@/features/pedidos/hooks/useCancelarPedido'
import { EstadoCarga, EstadoError, EstadoVacio } from '@/shared/components/Estados'
import { formatoPrecio } from '@/shared/formatoPrecio'

const LIMITE = 10
const fecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export default function MisPedidosPage() {
  const { state } = useLocation()
  const pedidoConfirmado: unknown = state?.pedidoConfirmado
  const usuarioId = useAuthStore(({ user }) => user?.id)
  const [pagina, setPagina] = useState(0)
  const cancelar = useCancelarPedido()
  const pedidos = useQuery({
    queryKey: ['pedidos', 'propios', usuarioId, pagina],
    queryFn: ({ signal }) => obtenerMisPedidos(pagina * LIMITE, LIMITE, signal),
    enabled: usuarioId !== undefined,
  })

  const totalPaginas = Math.ceil((pedidos.data?.total ?? 0) / LIMITE)

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-3xl font-bold">Mis pedidos</h1>
      {typeof pedidoConfirmado === 'number' && (
        <p role="status">Pedido #{pedidoConfirmado} confirmado.</p>
      )}
      {pedidos.isPending && <EstadoCarga mensaje="Cargando pedidos…" />}
      {pedidos.isError && (
        <div>
          <EstadoError mensaje={pedidos.error.message} />
          <button type="button" className="mt-2 underline" onClick={() => void pedidos.refetch()}>
            Reintentar
          </button>
        </div>
      )}
      {pedidos.data?.total === 0 && <EstadoVacio mensaje="Todavía no hiciste pedidos." />}
      <ul className="space-y-3">
        {pedidos.data?.items.map((pedido) => (
          <li key={pedido.id} className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <details>
              <summary className="cursor-pointer">
                <span className="ml-1 font-semibold">Pedido #{pedido.id}</span>
                <span className="mx-3 text-sm">{fecha.format(new Date(pedido.created_at))}</span>
                <BadgeEstado estado={pedido.estado} />
                <span className="ml-3 font-medium">{formatoPrecio(pedido.total)}</span>
              </summary>
              <div className="mt-4 space-y-3 border-t pt-4">
                <p>Entrega en {pedido.direccion_entrega}</p>
                <p>Pago por {pedido.forma_pago === 'EFECTIVO' ? 'efectivo' : 'transferencia'}</p>
                {pedido.notas && <p>Notas del pedido: {pedido.notas}</p>}
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {pedido.items.map((item) => (
                    <li key={item.producto_id} className="flex flex-wrap justify-between gap-2 py-2">
                      <span>{item.cantidad} × {item.nombre_producto} · {formatoPrecio(item.precio_unitario)} por unidad</span>
                      <span>{formatoPrecio(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
            {pedido.estado === 'PENDIENTE' && (
              <button
                type="button"
                disabled={cancelar.isPending}
                aria-label={`Cancelar pedido #${pedido.id}`}
                onClick={() => cancelar.mutate(pedido.id)}
                className="mt-4 rounded-lg border border-red-600 px-3 py-2 font-medium text-red-700 disabled:opacity-50 dark:text-red-300"
              >
                {cancelar.isPending && cancelar.variables === pedido.id ? 'Cancelando…' : 'Cancelar pedido'}
              </button>
            )}
            {cancelar.error && cancelar.variables === pedido.id && <EstadoError mensaje={cancelar.error.message} />}
          </li>
        ))}
      </ul>
      {(totalPaginas > 1 || pagina > 0) && (
        <nav aria-label="Paginación de mis pedidos" className="flex items-center justify-center gap-4">
          <button type="button" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)} className="underline disabled:opacity-50">Anterior</button>
          <span>Página {pagina + 1}</span>
          <button type="button" disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina(pagina + 1)} className="underline disabled:opacity-50">Siguiente</button>
        </nav>
      )}
      <Link to="/" className="underline">Volver al catálogo</Link>
    </section>
  )
}
