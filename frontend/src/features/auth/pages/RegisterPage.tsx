import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRegister } from '@/features/auth/hooks/useRegister'


function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isChecking } = useAuth()
  const registro = useRegister()

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await registro.mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/login', { replace: true, state: location.state })
      } catch {
        // El formulario muestra el error de la mutación.
      }
    },
  })

  if (!isChecking && user) return <Navigate to="/" replace />

  return (
    <div className="mx-auto mt-8 max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-8 shadow">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Crear cuenta</h1>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        {([['username', 'Nombre de usuario', 'username'], ['full_name', 'Nombre completo', 'name']] as const).map(([name, label, autocomplete]) => (
          <form.Field
            key={name}
            name={name}
            validators={{ onChange: ({ value }) => value.trim() ? undefined : 'Campo obligatorio' }}
          >
            {(field) => (
              <div>
                <label htmlFor={field.name} className="mb-1 block font-medium">{label}</label>
                <input
                  id={field.name}
                  autoComplete={autocomplete}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-300">{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>
        ))}

        <form.Field name="email" validators={{ onChange: ({ value }) => value.includes('@') ? undefined : 'Email inválido' }}>
          {(field) => (
            <div className="sm:col-span-2">
              <label htmlFor={field.name} className="mb-1 block font-medium">Email</label>
              <input id={field.name} type="email" autoComplete="email" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2" />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{field.state.meta.errors.join(', ')}</p>}
            </div>
          )}
        </form.Field>

        <form.Field name="password" validators={{ onChange: ({ value }) => value.length >= 8 && value.length <= 72 ? undefined : 'Debe tener entre 8 y 72 caracteres' }}>
          {(field) => (
            <div className="sm:col-span-2">
              <label htmlFor={field.name} className="mb-1 block font-medium">Contraseña</label>
              <input id={field.name} type="password" autoComplete="new-password" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2" />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{field.state.meta.errors.join(', ')}</p>}
            </div>
          )}
        </form.Field>

        {registro.error && <p className="sm:col-span-2 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">{registro.error.message}</p>}

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <button type="submit" disabled={!canSubmit || registro.isPending} className="sm:col-span-2 rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-50">
              {registro.isPending ? 'Registrando...' : 'Crear cuenta'}
            </button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿Ya tenés cuenta? <Link to="/login" state={location.state} className="font-medium text-emerald-700 dark:text-emerald-300">Iniciá sesión</Link>
      </p>
    </div>
  )
}

export default RegisterPage
