import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import type { UsuarioAuth } from '@/features/auth/types/auth.types'

interface UsuariosTableProps {
  usuarios: UsuarioAuth[]
  usuarioActualId?: number
  cambiandoEstado: boolean
  onCambiarEstado: (id: number, activar: boolean) => void
}

export function UsuariosTable({ usuarios, usuarioActualId, cambiandoEstado, onCambiarEstado }: UsuariosTableProps) {
  const columnas: ColumnDef<UsuarioAuth>[] = [
    { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol' },
    { accessorKey: 'disabled', header: 'Estado', cell: ({ row }) => row.original.disabled ? 'Desactivado' : 'Activo' },
    {
      id: 'accion',
      header: 'Acción',
      cell: ({ row }) => {
        const usuario = row.original
        if (usuario.id === usuarioActualId) return <span>Tu cuenta</span>
        return (
          <button
            type="button"
            disabled={cambiandoEstado}
            onClick={() => onCambiarEstado(usuario.id, usuario.disabled)}
            className="rounded-lg border px-3 py-2 font-medium disabled:opacity-50"
          >
            {usuario.disabled ? 'Activar' : 'Desactivar'}
          </button>
        )
      },
    },
  ]
  const tabla = useReactTable({ data: usuarios, columns: columnas, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow dark:bg-slate-900">
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
  )
}
