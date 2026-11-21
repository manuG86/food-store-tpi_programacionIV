import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'

import { useAuthStore } from '@/features/auth'
import { cambiarEstadoPedido, obtenerPedidosAdmin } from '@/features/pedidos/api/pedidosApi'
import { invalidarConsultasPedido } from '@/features/pedidos/hooks/invalidarConsultasPedido'
import { BadgeEstado } from '@/features/pedidos/components/BadgeEstado'
import type { EstadoPedido, Pedido } from '@/features/pedidos/types/pedido'
import { EstadoCarga, EstadoError, EstadoVacio } from '@/shared/components/Estados'
import { formatoPrecio } from '@/shared/formatoPrecio'

const LIMITE = 20
const pedidosVacios: Pedido[] = []
const estados: { value: EstadoPedido; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PREPARACION', label: 'En preparación' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'CANCELADO', label: 'Cancelado' },
]
const acciones = {
  PENDIENTE: [['EN_PREPARACION', 'Preparar'], ['CANCELADO', 'Cancelar']],
  EN_PREPARACION: [['ENTREGADO', 'Marcar entregado'], ['CANCELADO', 'Cancelar']],
  ENTREGADO: [],
  CANCELADO: [],
} satisfies Record<EstadoPedido, [EstadoPedido, string][]>

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>()
  const [pagina, setPagina] = useState(0)
  const adminId = useAuthStore(({ user }) => user?.id)
  const queryClient = useQueryClient()
  const filtros = { estado, skip: pagina * LIMITE, limit: LIMITE }
  const pedidos = useQuery({
    queryKey: ['pedidos', 'admin', adminId, filtros],
    queryFn: ({ signal }) => obtenerPedidosAdmin(filtros, signal),
  })
  const cambiar = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: (_, cambio) => invalidarConsultasPedido(queryClient, cambio.estado === 'CANCELADO'),
  })

  const columnas: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: 'Pedido', cell: ({ row }) => `#${row.original.id}` },
    { accessorKey: 'usuario_id', header: 'ID de usuario' },
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    { accessorKey: 'total', header: 'Total', cell: ({ row }) => formatoPrecio(row.original.total) },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const pedido = row.original
        return (
          <div className="flex flex-wrap gap-3">
            {acciones[pedido.estado].map(([destino, etiqueta]) => (
              <button
                key={destino}
                type="button"
                className="underline disabled:opacity-50"
                disabled={cambiar.isPending}
                onClick={() => cambiar.mutate({ id: pedido.id, estado: destino })}
              >{etiqueta}</button>
            ))}
          </div>
        )
      },
    },
  ]
  const tabla = useReactTable({
    data: pedidos.data?.items ?? pedidosVacios,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  })
  const totalPaginas = Math.ceil((pedidos.data?.total ?? 0) / LIMITE)

  return (
    <section aria-labelledby="titulo-pedidos">
      <h1 id="titulo-pedidos" className="text-3xl font-bold">Pedidos</h1>
      <label className="my-5 grid w-fit gap-1">
        Filtrar por estado
        <select
          value={estado ?? ''}
          onChange={(evento) => {
            setEstado(estados.find((opcion) => opcion.value === evento.target.value)?.value)
            setPagina(0)
            cambiar.reset()
          }}
          className="rounded-lg border px-3 py-2 dark:bg-slate-900"
        >
          <option value="">Todos los estados</option>
          {estados.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {pedidos.isPending && <EstadoCarga mensaje="Cargando pedidos…" />}
      {pedidos.isError && <EstadoError mensaje={pedidos.error.message} />}
      {cambiar.isError && <EstadoError mensaje={cambiar.error.message} />}
      {pedidos.data?.total === 0 && <EstadoVacio mensaje="No hay pedidos para este filtro." />}
      {tabla.getRowModel().rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl bg-white shadow dark:bg-slate-900">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-100 dark:bg-slate-800">
              {tabla.getHeaderGroups().map((grupo) => (
                <tr key={grupo.id}>
                  {grupo.headers.map((encabezado) => (
                    <th key={encabezado.id} className="px-4 py-3">{flexRender(encabezado.column.columnDef.header, encabezado.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {tabla.getRowModel().rows.map((fila) => (
                <tr key={fila.id} className="border-t border-slate-200 dark:border-slate-700">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3">{flexRender(celda.column.columnDef.cell, celda.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(totalPaginas > 1 || pagina > 0) && (
        <nav aria-label="Paginación de pedidos" className="mt-5 flex justify-center gap-4">
          <button type="button" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)} className="underline disabled:opacity-50">Anterior</button>
          <span>Página {pagina + 1}</span>
          <button type="button" disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina(pagina + 1)} className="underline disabled:opacity-50">Siguiente</button>
        </nav>
      )}
    </section>
  )
}
