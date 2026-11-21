import type { ProductoCatalogo } from '@/features/products/types/producto'
import { formatoPrecio } from '@/shared/formatoPrecio'
import { useCartStore } from '@/store/cartStore'

export default function ProductoCard({ producto }: { producto: ProductoCatalogo }) {
  const cantidad = useCartStore((state) =>
    state.items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0,
  )
  const agregar = useCartStore((state) => state.agregar)
  const disponible = producto.disponible && producto.stock > 0

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {producto.imagen_url && (
        <img src={producto.imagen_url} alt={producto.nombre} loading="lazy" className="aspect-video w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-sm text-slate-600 dark:text-slate-300">{producto.categoria.nombre}</p>
        <h2 className="text-lg font-semibold">{producto.nombre}</h2>
        {producto.descripcion && <p className="text-sm">{producto.descripcion}</p>}
        <p className="mt-auto font-semibold">{formatoPrecio(producto.precio_base)}</p>
        <p className="text-sm">
          {disponible ? producto.stock + (producto.stock === 1 ? ' unidad disponible' : ' unidades disponibles') : 'No disponible'}
        </p>
        <button
          type="button"
          disabled={!disponible || cantidad >= producto.stock}
          onClick={() => agregar(producto)}
          className="rounded-lg bg-emerald-700 px-3 py-2 font-medium text-white disabled:opacity-50"
        >
          Agregar al carrito
        </button>
        {cantidad > 0 && <p role="status" className="text-sm">En el carrito: {cantidad}</p>}
      </div>
    </article>
  )
}
