export interface Categoria {
  id: number
  nombre: string
  descripcion: string
}

export interface CategoriaFormData {
  nombre: string
  descripcion: string
}

export interface CategoriaListResponse {
  total: number
  items: Categoria[]
}