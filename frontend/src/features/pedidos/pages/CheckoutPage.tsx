import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'

import { useCrearPedido } from '@/features/pedidos/hooks/useCrearPedido'
import type { FormaPago } from '@/features/pedidos/types/pedido'
import { EstadoError } from '@/shared/components/Estados'
import { formatoPrecio } from '@/shared/formatoPrecio'
import { totalCarrito, useCartStore } from '@/store/cartStore'

const formasPago: { value: FormaPago; label: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
]

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const vaciar = useCartStore((state) => state.vaciar)
  const navigate = useNavigate()
  const compra = useCrearPedido()

  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: formasPago[0].value, notas: '' },
    onSubmit: async ({ value }) => {
      if (!items.length || compra.isPending) return
      try {
        const pedido = await compra.mutateAsync({
          items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() || undefined,
        })
        vaciar()
        navigate('/mis-pedidos', { replace: true, state: { pedidoConfirmado: pedido.id } })
      } catch {
        // La mutación conserva el error para mostrarlo junto al formulario.
      }
    },
  })

  if (items.length === 0) {
    return <p>Tu carrito está vacío. <Link to="/" className="underline">Ver catálogo</Link></p>
  }

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">Confirmar pedido</h1>
      <form className="mt-6 space-y-5" onSubmit={(evento) => {
        evento.preventDefault()
        void form.handleSubmit()
      }}>
        <form.Field name="direccion_entrega" validators={{
          onChange: ({ value }) => value.trim().length < 5 || value.trim().length > 200
            ? 'Ingresá una dirección de 5 a 200 caracteres.'
            : undefined,
        }}>
          {(field) => (
            <label className="grid gap-2">
              Dirección de entrega
              <input
                name={field.name}
                autoComplete="street-address"
                required
                maxLength={200}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(evento) => field.handleChange(evento.target.value)}
                className="rounded-lg border border-slate-400 px-3 py-2"
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                <span className="text-sm text-red-700 dark:text-red-300">{field.state.meta.errors.join(', ')}</span>
              )}
            </label>
          )}
        </form.Field>
        <form.Field name="forma_pago">
          {(field) => (
            <label className="grid gap-2">
              Forma de pago
              <select value={field.state.value} onChange={(evento) => {
                const opcion = formasPago.find(({ value }) => value === evento.target.value)
                if (opcion) field.handleChange(opcion.value)
              }} className="rounded-lg border border-slate-400 px-3 py-2 dark:bg-slate-900">
                {formasPago.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          )}
        </form.Field>
        <form.Field name="notas">
          {(field) => (
            <label className="grid gap-2">
              Notas (opcional)
              <textarea value={field.state.value} onChange={(evento) => field.handleChange(evento.target.value)} className="rounded-lg border border-slate-400 px-3 py-2" />
            </label>
          )}
        </form.Field>
        <p className="text-lg font-semibold">Total estimado {formatoPrecio(totalCarrito(items))}</p>
        {compra.error && <EstadoError mensaje={compra.error.message} />}
        <div className="flex flex-wrap items-center gap-4">
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <button type="submit" disabled={!canSubmit || isSubmitting || compra.isPending} className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-50">
                {isSubmitting ? 'Confirmando…' : 'Confirmar pedido'}
              </button>
            )}
          </form.Subscribe>
          <Link to="/carrito" className="underline">Volver al carrito</Link>
        </div>
      </form>
    </section>
  )
}
