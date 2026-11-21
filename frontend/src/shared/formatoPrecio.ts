const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

export function formatoPrecio(valor: number): string {
  return moneda.format(valor)
}
