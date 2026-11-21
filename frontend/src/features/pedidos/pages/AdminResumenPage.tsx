import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '@/features/auth'
import { obtenerResumenPedidos } from '@/features/pedidos/api/pedidosApi'
import { EstadoCarga, EstadoError } from '@/shared/components/Estados'
import { formatoPrecio } from '@/shared/formatoPrecio'

export default function AdminResumenPage() {
  const adminId = useAuthStore(({ user }) => user?.id)
  const resumen = useQuery({
    queryKey: ['pedidos', 'resumen', adminId],
    queryFn: ({ signal }) => obtenerResumenPedidos(signal),
  })
  const datos = resumen.data
  const indicadores = datos ? [
    ['Pendientes', datos.pendientes],
    ['En preparación', datos.en_preparacion],
    ['Entregados', datos.entregados],
    ['Cancelados', datos.cancelados],
    ['Pedidos de hoy', datos.pedidos_hoy],
    ['Ingresos de pedidos entregados', formatoPrecio(datos.ingresos_entregados)],
  ] : []

  return (
    <section aria-labelledby="titulo-resumen">
      <h1 id="titulo-resumen" className="text-3xl font-bold">Resumen</h1>
      {resumen.isPending && <EstadoCarga mensaje="Cargando resumen…" />}
      {resumen.isError && <EstadoError mensaje={resumen.error.message} />}
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {indicadores.map(([nombre, valor]) => (
          <div key={nombre} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <dt className="text-sm text-slate-600 dark:text-slate-300">{nombre}</dt>
            <dd className="mt-2 text-3xl font-bold">{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
