import { useForm } from '@tanstack/react-form'

import type { Categoria } from '@/features/categories/types/categoria'
import type { GuardarProducto } from '@/features/products/hooks/useProducts'
import type { ProductoCatalogo } from '@/features/products/types/producto'
import { EstadoError } from '@/shared/components/Estados'

interface ProductModalProps {
  producto: ProductoCatalogo | null
  soloStock: boolean
  categorias: Categoria[]
  isPending: boolean
  errorMessage: string | null
  onClose: () => void
  onSubmit: (cambio: GuardarProducto) => void
}

const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900'

export default function ProductModal({
  producto, soloStock, categorias, isPending, errorMessage, onClose, onSubmit,
}: ProductModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base.toString() ?? '',
      imagen_url: producto?.imagen_url ?? '',
      categoria_id: producto?.categoria_id.toString() ?? '',
      stock: producto?.stock.toString() ?? '0',
      disponible: producto?.disponible ?? true,
    },
    onSubmit: ({ value }) => {
      const stock = { stock: Number(value.stock), disponible: value.disponible }
      if (soloStock && producto) {
        onSubmit({ tipo: 'stock', id: producto.id, datos: stock })
        return
      }
      const categoriaId = Number(value.categoria_id)
      const datos = {
        nombre: value.nombre.trim(),
        precio_base: Number(value.precio_base),
        descripcion: value.descripcion.trim() || null,
        imagen_url: value.imagen_url.trim() || null,
      }
      if (producto) {
        onSubmit({
          tipo: 'editar', id: producto.id,
          datos: { ...datos, ...(categoriaId !== producto.categoria_id && { categoria_id: categoriaId }) },
        })
      } else {
        onSubmit({ tipo: 'crear', datos: { ...datos, ...stock, categoria_id: categoriaId } })
      }
    },
  })

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="titulo-modal-producto" className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <h2 id="titulo-modal-producto" className="text-xl font-bold">
          {soloStock ? 'Editar stock y disponibilidad' : producto ? 'Editar producto' : 'Nuevo producto'}
        </h2>
        {soloStock && <p className="mt-2">{producto?.nombre}</p>}
        <form className="mt-5 space-y-4" onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}>
          {!soloStock && (
            <>
              <form.Field name="nombre">
                {(field) => (
                  <label className="grid gap-1">
                    Nombre
                    <input required className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} pattern=".*\S.*" />
                  </label>
                )}
              </form.Field>
              <form.Field name="categoria_id">
                {(field) => (
                  <label className="grid gap-1">
                    Categoría
                    <select required className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}>
                      <option value="" disabled>Seleccioná una categoría</option>
                      {producto && !categorias.some(({ id }) => id === producto.categoria_id) && (
                        <option value={producto.categoria_id}>{producto.categoria.nombre} (dada de baja)</option>
                      )}
                      {categorias.map(({ id, nombre }) => <option key={id} value={id}>{nombre}</option>)}
                    </select>
                  </label>
                )}
              </form.Field>
              <form.Field name="precio_base">
                {(field) => (
                  <label className="grid gap-1">
                    Precio
                    <input required type="number" min="0" step="any" className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                  </label>
                )}
              </form.Field>
              <form.Field name="descripcion">
                {(field) => (
                  <label className="grid gap-1">
                    Descripción
                    <textarea className={inputClass} rows={2} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                  </label>
                )}
              </form.Field>
              <form.Field name="imagen_url">
                {(field) => (
                  <label className="grid gap-1">
                    URL de imagen
                    <input type="url" className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                  </label>
                )}
              </form.Field>
            </>
          )}
          {(soloStock || !producto) && (
            <>
              <form.Field name="stock">
                {(field) => (
                  <label className="grid gap-1">
                    Stock
                    <input required type="number" min="0" step="1" className={inputClass} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                  </label>
                )}
              </form.Field>
              <form.Field name="disponible">
                {(field) => (
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
                    Disponible
                  </label>
                )}
              </form.Field>
            </>
          )}
          {errorMessage && <EstadoError mensaje={errorMessage} />}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isPending} className="rounded-lg border px-4 py-2">Cancelar</button>
            <button type="submit" disabled={isPending} className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-50">
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
