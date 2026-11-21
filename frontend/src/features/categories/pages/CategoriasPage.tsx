import CategoriaList from '@/features/categories/components/CategoriaList'
import { EstadoCarga, EstadoVacio, EstadoError } from '@/shared/components/Estados'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useCategories } from '@/features/categories/hooks/useCategories'
import CategoryModal from '@/features/categories/components/CategoryModal'
import type {
  Categoria,
  CategoriaFormData,
} from '@/features/categories/types/categoria'
import { useAuthStore } from '@/features/auth'


function CategoriasPage() {
  const esAdmin = useAuthStore((state) => state.user?.role === 'admin')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null)

  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [filtroNombre, setFiltroNombre] = useState('')
  const columnFilters = useMemo(
    () => (filtroNombre ? [{ id: 'nombre', value: filtroNombre }] : []),
    [filtroNombre],
  )

  const { categoriasQuery, crearMutation, actualizarMutation, eliminarMutation } = useCategories()

  function abrirModalCreacion() {
    setCategoriaSeleccionada(null)
    crearMutation.reset()
    actualizarMutation.reset()
    setModalAbierto(true)
  }

  function abrirModalEdicion(categoria: Categoria) {
    setCategoriaSeleccionada(categoria)
    crearMutation.reset()
    actualizarMutation.reset()
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setCategoriaSeleccionada(null)
  }

  function guardarCategoria(datos: CategoriaFormData) {
    crearMutation.reset()
    actualizarMutation.reset()

    if (categoriaSeleccionada) {
      actualizarMutation.mutate({
        id: categoriaSeleccionada.id,
        datos,
      }, { onSuccess: cerrarModal })
    } else {
      crearMutation.mutate(datos, { onSuccess: cerrarModal })
    }
  }

  function confirmarEliminacion(categoria: Categoria) {
    const confirmada = window.confirm(
      `¿Eliminar la categoría "${categoria.nombre}"?`,
    )

    if (confirmada) {
      eliminarMutation.mutate(categoria.id)
    }
  }

  function aplicarFiltro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    tabla.setPageIndex(0)
    setFiltroNombre(textoBusqueda.trim())
  }

  const categorias = categoriasQuery.data?.items ?? []
  const totalCategorias = categoriasQuery.data?.total ?? 0


  const columnas: ColumnDef<Categoria>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => row.original.descripcion || 'Sin descripción',
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        if (!esAdmin) return null
        const categoria = row.original

        return (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => abrirModalEdicion(categoria)}
              className="rounded-lg bg-amber-500 px-3 py-2 text-white hover:bg-amber-600"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => confirmarEliminacion(categoria)}
              disabled={eliminarMutation.isPending}
              className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        )
      },
    },
  ]

  const tabla = useReactTable({
    data: categorias,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { columnFilters },
    initialState: { pagination: { pageSize: 5 } },
  })

  if (categoriasQuery.isLoading) {
    return (
      <EstadoCarga mensaje="Cargando categorías..." />
    )
  }

  if (categoriasQuery.isError) {
    return (
      <EstadoError mensaje={categoriasQuery.error.message} />
    )
  }

  const formularioPending =
    crearMutation.isPending || actualizarMutation.isPending

  const errorFormulario =
    crearMutation.error ?? actualizarMutation.error

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Categorías
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Administración de categorías.
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Total registrado: {totalCategorias}
          </p>
        </div>

        {esAdmin && (
          <button
            type="button"
            onClick={abrirModalCreacion}
            className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Nueva categoría
          </button>
        )}
      </div>

      <form
        onSubmit={aplicarFiltro}
        className="mt-6 flex gap-2"
      >
        <input
          type="search"
          value={textoBusqueda}
          onChange={(event) =>
            setTextoBusqueda(event.target.value)
          }
          placeholder="Buscar por nombre..."
          className="w-full max-w-md rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
        />

        <button
          type="submit"
          className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
        >
          Buscar
        </button>
      </form>

      {eliminarMutation.isError && (
        <p className="mt-4 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-red-700 dark:text-red-300">
          {eliminarMutation.error.message}
        </p>
      )}

      {tabla.getFilteredRowModel().rows.length === 0 ? (
        <EstadoVacio mensaje="No se encontraron categorías." />
      ) : (
        <CategoriaList tabla={tabla} />
      )}

      {tabla.getPageCount() > 0 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => tabla.previousPage()}
            disabled={!tabla.getCanPreviousPage()}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-slate-600 dark:text-slate-300">
            Página {tabla.getState().pagination.pageIndex + 1} de {tabla.getPageCount()}
          </span>

          <button
            type="button"
            onClick={() => tabla.nextPage()}
            disabled={!tabla.getCanNextPage()}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      {modalAbierto && (
        <CategoryModal
          key={categoriaSeleccionada?.id ?? 'nueva'}
          categoria={categoriaSeleccionada}
          isPending={formularioPending}
          errorMessage={errorFormulario?.message ?? null}
          onClose={cerrarModal}
          onSubmit={guardarCategoria}
        />
      )}
    </section>
  )
}

export default CategoriasPage
