import { useForm } from '@tanstack/react-form'

import type {
  Categoria,
  CategoriaFormData,
} from '@/features/categories/types/categoria'


interface CategoryModalProps {
  categoria: Categoria | null
  isPending: boolean
  errorMessage: string | null
  onClose: () => void
  onSubmit: (datos: CategoriaFormData) => void
}


function CategoryModal({
  categoria,
  isPending,
  errorMessage,
  onClose,
  onSubmit,
}: CategoryModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    } satisfies CategoriaFormData,

    onSubmit: ({ value }) => {
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      })
    },
  })

  const estaEditando = categoria !== null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {estaEditando ? 'Editar categoría' : 'Nueva categoría'}
        </h2>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => {
                const nombre = value.trim()

                if (nombre.length < 2) {
                  return 'El nombre debe tener al menos 2 caracteres'
                }

                if (nombre.length > 100) {
                  return 'El nombre no puede superar los 100 caracteres'
                }

                return undefined
              },
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block font-medium text-slate-700 dark:text-slate-200"
                >
                  Nombre
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2"
                />

                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="descripcion"
            validators={{
              onChange: ({ value }) => {
                if (value.length > 500) {
                  return 'La descripción no puede superar los 500 caracteres'
                }

                return undefined
              },
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block font-medium text-slate-700 dark:text-slate-200"
                >
                  Descripción
                </label>

                <textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  maxLength={500}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2"
                />

                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          {errorMessage && (
            <p className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2"
            >
              Cancelar
            </button>

            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
              ]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    isPending
                  }
                  className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-50"
                >
                  {isPending
                    ? 'Guardando...'
                    : estaEditando
                      ? 'Guardar cambios'
                      : 'Crear categoría'}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryModal