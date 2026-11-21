import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'
import type { Categoria } from '@/features/categories/types/categoria'

interface CategoriaListProps {
  tabla: Table<Categoria>
}

export default function CategoriaList({ tabla }: CategoriaListProps) {
  return (
        <div className="mt-6 overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow">
          <table className="w-full border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800">
              {tabla.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 last:text-right"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!header.column.getCanSort()}
                          className="font-semibold"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {tabla.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-slate-700 dark:text-slate-200"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  )
}
