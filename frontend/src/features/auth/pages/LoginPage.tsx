import { useForm } from '@tanstack/react-form'
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/hooks/useAuth'


function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const origen: unknown = location.state?.from
  const destino = origen === '/checkout' || origen === '/mis-pedidos' ? origen : '/' 
  const { user, login, isChecking, isSubmitting, error } = useAuth()

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      try {
        await login(value.username.trim(), value.password)
        navigate(destino, { replace: true })
      } catch {
        // El mensaje ya queda almacenado en AuthStore.
      }
    },
  })

  if (!isChecking && user) return <Navigate to={destino} replace />

  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Iniciar sesión</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Ingresá con tu nombre de usuario y contraseña.</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) =>
              value.trim() ? undefined : 'Ingresá tu nombre de usuario',
          }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className="mb-1 block font-medium">Nombre de usuario</label>
              <input
                id={field.name}
                autoComplete="username"
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

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value.length >= 8 ? undefined : 'La contraseña debe tener al menos 8 caracteres',
          }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className="mb-1 block font-medium">Contraseña</label>
              <input
                id={field.name}
                type="password"
                autoComplete="current-password"
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

        {error && <p className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿No tenés cuenta? <Link to="/register" state={location.state} className="font-medium text-emerald-700 dark:text-emerald-300">Registrate</Link>
      </p>
    </div>
  )
}

export default LoginPage
