import { Link } from 'react-router-dom'


function UnauthorizedPage() {
  return (
    <section className="mx-auto mt-16 max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-8 text-center shadow">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Acceso no autorizado</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">Tu usuario no tiene el rol requerido para esta sección.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-white">Volver al catálogo</Link>
    </section>
  )
}

export default UnauthorizedPage
