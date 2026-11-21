import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ProductoCatalogo } from '@/features/products/types/producto'

interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  stock?: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: ProductoCatalogo) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
}

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  agregar: (producto) => set(({ items }) => {
    const existente = items.find((item) => item.producto_id === producto.id)
    const cantidad = existente?.cantidad ?? 0
    if (!producto.activo || !producto.disponible || cantidad >= producto.stock) return { items }

    const item = {
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      cantidad: cantidad + 1,
      stock: producto.stock,
    }
    return {
      items: existente ? items.map((actual) => actual.producto_id === producto.id ? item : actual) : [...items, item],
    }
  }),
  quitar: (productoId) => set(({ items }) => ({
    items: items.filter((item) => item.producto_id !== productoId),
  })),
  cambiarCantidad: (productoId, cantidad) => {
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) return
    set(({ items }) => ({
      items: items.map((item) => (
        item.producto_id === productoId && (item.stock === undefined || cantidad <= item.stock)
          ? { ...item, cantidad }
          : item
      )),
    }))
  },
  vaciar: () => set({ items: [] }),
}), {
  name: 'food-store-cart',
  partialize: ({ items }) => ({ items }),
}))

export function totalCarrito(items: CartState['items']): number {
  return items.reduce((total, item) => total + item.precio_unitario * item.cantidad, 0)
}
