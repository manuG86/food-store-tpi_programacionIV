import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'

import ProductModal from '@/features/products/components/ProductoModal'
import { useProducts } from '@/features/products/hooks/useProducts'
import type { ProductoCatalogo } from '@/features/products/types/producto'
import { EstadoCarga, EstadoError, EstadoVacio } from '@/shared/components/Estados'
import { formatoPrecio } from '@/shared/formatoPrecio'

type Modal = { producto: ProductoCatalogo | null; soloStock: boolean }
const productosVacios: ProductoCatalogo[] = []

export default function ProductsPage() {
  const [modal, setModal] = useState<Modal | null>(null)
  const { productosQuery, categoriasQuery, guardarMutation, eliminarMutation } = useProducts()

  function abrir(producto: ProductoCatalogo | null, soloStock = false) {
    guardarMutation.reset()
    setModal({ producto, soloStock })
  }

  const columnas: ColumnDef<ProductoCatalogo>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    { id: 'categoria', header: 'Categoría', cell: ({ row }) => row.original.categoria.nombre },
    { accessorKey: 'precio_base', header: 'Precio', cell: ({ row }) => formatoPrecio(row.original.precio_base) },
    { accessorKey: 'stock', header: 'Stock' },
    { accessorKey: 'disponible', header: 'Disponibilidad', cell: ({ row }) => row.original.disponible ? 'Disponible' : 'No disponible' },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-3">
          <button type="button" className="underline" onClick={() => abrir(row.original)}>Editar</button>
          <button type="button" className="underline" onClick={() => abrir(row.original, true)}>Editar stock</button>
          <button type="button" className="text-red-700 underline dark:text-red-300" disabled={eliminarMutation.isPending} onClick={() => {
            if (window.confirm(`¿Dar de baja «${row.original.nombre}»?`)) eliminarMutation.mutate(row.original.id)
          }}>Dar de baja</button>
        </div>
      ),
    },
  ]

  const productos = productosQuery.data ?? productosVacios
  const categorias = categoriasQuery.data?.items ?? []
  const tabla = useReactTable({
    data: productos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Productos</h1>
        <button type="button" disabled={!categorias.length} className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-50" onClick={() => abrir(null)}>Nuevo producto</button>
      </div>
      {categoriasQuery.isError && <EstadoError mensaje={categoriasQuery.error.message} />}
      {categoriasQuery.isSuccess && !categorias.length && <p className="mt-4">Creá una categoría activa para agregar productos.</p>}
      {productosQuery.isPending && <EstadoCarga mensaje="Cargando productos…" />}
      {productosQuery.isError && <EstadoError mensaje={productosQuery.error.message} />}
      {eliminarMutation.isError && <EstadoError mensaje={eliminarMutation.error.message} />}
      {productosQuery.isSuccess && !productos.length && <EstadoVacio mensaje="No hay productos registrados." />}
      {productos.length > 0 && (
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
      )}
      {tabla.getPageCount() > 1 && (
        <nav aria-label="Paginación de productos" className="mt-6 flex justify-center gap-4">
          <button type="button" disabled={!tabla.getCanPreviousPage()} onClick={() => tabla.previousPage()} className="underline disabled:opacity-50">Anterior</button>
          <span>Página {tabla.getState().pagination.pageIndex + 1} de {tabla.getPageCount()}</span>
          <button type="button" disabled={!tabla.getCanNextPage()} onClick={() => tabla.nextPage()} className="underline disabled:opacity-50">Siguiente</button>
        </nav>
      )}
      {modal && (
        <ProductModal
          producto={modal.producto}
          soloStock={modal.soloStock}
          categorias={categorias}
          isPending={guardarMutation.isPending}
          errorMessage={guardarMutation.error?.message ?? null}
          onClose={() => setModal(null)}
          onSubmit={(cambio) => guardarMutation.mutate(cambio, { onSuccess: () => setModal(null) })}
        />
      )}
    </section>
  )
}
