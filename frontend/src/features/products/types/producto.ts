import type { Categoria } from '@/features/categories/types/categoria'

export interface ProductoCatalogo {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria & { activo: boolean }
}

export interface ProductosPaginados {
  total: number
  items: ProductoCatalogo[]
}

export interface FiltrosProductos {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}

export interface ProductoStock {
  stock: number
  disponible: boolean
}

export interface ProductoDatos {
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  categoria_id?: number
}

export type ProductoCreate = ProductoDatos & ProductoStock & { categoria_id: number }
