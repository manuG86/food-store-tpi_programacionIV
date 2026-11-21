import { Link } from 'react-router-dom'

import { formatoPrecio } from '@/shared/formatoPrecio'
import { totalCarrito, useCartStore } from '@/store/cartStore'

export default function CarritoPage() {
  const items = useCartStore((state) => state.items)
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad)
  const quitar = useCartStore((state) => state.quitar)

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Carrito</h1>
      {items.length === 0 ? (
        <div className="mt-6 space-y-3">
          <p>Tu carrito está vacío.</p>
          <Link to="/" className="underline">Ver catálogo</Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-slate-300">
            {items.map((item) => (
              <li key={item.producto_id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <h2 className="font-semibold">{item.nombre}</h2>
                  <p>{formatoPrecio(item.precio_unitario)} por unidad</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" className="rounded border px-2 disabled:opacity-40" aria-label={`Reducir cantidad de ${item.nombre}`} disabled={item.cantidad <= 1} onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}>−</button>
                  <span aria-label="Cantidad">{item.cantidad}</span>
                  <button type="button" className="rounded border px-2 disabled:opacity-40" aria-label={`Aumentar cantidad de ${item.nombre}`} disabled={item.stock !== undefined && item.cantidad >= item.stock} onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}>+</button>
                  <button type="button" aria-label={`Quitar ${item.nombre}`} className="underline" onClick={() => quitar(item.producto_id)}>Quitar</button>
                </div>
                <p className="font-medium">{formatoPrecio(item.cantidad * item.precio_unitario)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
            <p className="text-lg font-semibold">Total {formatoPrecio(totalCarrito(items))}</p>
            <Link to="/checkout" className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white">Continuar al checkout</Link>
          </div>
        </>
      )}
    </section>
  )
}
