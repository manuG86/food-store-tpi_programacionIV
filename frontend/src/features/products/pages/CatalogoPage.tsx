import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { obtenerTodasCategorias } from '@/features/categories/api/categoriasApi'
import { obtenerProductosPaginados } from '@/features/products/api/productosApi'
import ProductoCard from '@/features/products/components/ProductoCard'
import { EstadoError, EstadoVacio } from '@/shared/components/Estados'

const LIMITE = 6

export default function CatalogoPage() {
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pagina, setPagina] = useState(0)

  const categorias = useQuery({ queryKey: ['categorias'], queryFn: obtenerTodasCategorias })
  const filtros = {
    skip: pagina * LIMITE,
    limit: LIMITE,
    search: texto.trim() || undefined,
    categoria_id: categoria ? Number(categoria) : undefined,
  }
  const productos = useQuery({
    queryKey: ['productos', filtros],
    queryFn: ({ signal }) => obtenerProductosPaginados(filtros, signal),
  })
  const total = productos.data?.total ?? 0
  const totalPaginas = Math.ceil(total / LIMITE)

  return (
    <section aria-labelledby="titulo-catalogo">
      <h1 id="titulo-catalogo" className="text-3xl font-bold">Catálogo</h1>
      <div className="my-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 font-medium">
          Buscar productos
          <input
            type="search"
            value={texto}
            onChange={(event) => {
              setTexto(event.target.value)
              setPagina(0)
            }}
            className="rounded-lg border border-slate-400 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 font-medium">
          Categoría
          <select
            value={categoria}
            disabled={categorias.isPending || categorias.isError}
            onChange={(event) => {
              setCategoria(event.target.value)
              setPagina(0)
            }}
            className="rounded-lg border border-slate-400 px-3 py-2 dark:bg-slate-900"
          >
            <option value="">Todas las categorías</option>
            {categorias.data?.items.map((item) => (
              <option key={item.id} value={item.id}>{item.nombre}</option>
            ))}
          </select>
        </label>
      </div>
      {categorias.isError && <EstadoError mensaje={categorias.error.message} />}

      {productos.isPending && (
        <div role="status" aria-label="Cargando productos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: LIMITE }, (_, index) => (
            <div key={index} aria-hidden="true" className="h-44 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      )}
      {productos.isError && (
        <div>
          <EstadoError mensaje={productos.error.message} />
          <button type="button" className="mt-2 underline" onClick={() => void productos.refetch()}>
            Reintentar
          </button>
        </div>
      )}
      {productos.data?.items.length === 0 && (
        <EstadoVacio mensaje="No encontramos productos para esta búsqueda." />
      )}
      {productos.data && productos.data.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productos.data.items.map((producto) => <ProductoCard key={producto.id} producto={producto} />)}
        </div>
      )}
      {(totalPaginas > 1 || pagina > 0) && (
        <nav aria-label="Paginación del catálogo" className="mt-6 flex items-center justify-center gap-4">
          <button type="button" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)} className="underline disabled:opacity-50">
            Anterior
          </button>
          <span>Página {pagina + 1}{totalPaginas > 0 && ' de ' + totalPaginas}</span>
          <button type="button" disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina(pagina + 1)} className="underline disabled:opacity-50">
            Siguiente
          </button>
        </nav>
      )}
    </section>
  )
}
