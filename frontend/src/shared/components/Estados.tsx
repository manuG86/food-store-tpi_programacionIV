interface EstadoProps {
  mensaje: string
}

export function EstadoCarga({ mensaje }: EstadoProps) {
  return <p role="status" className="mt-6 text-slate-600 dark:text-slate-300">{mensaje}</p>
}

export function EstadoVacio({ mensaje }: EstadoProps) {
  return <p role="status" className="mt-6 text-slate-600 dark:text-slate-300">{mensaje}</p>
}

export function EstadoError({ mensaje }: EstadoProps) {
  return <p role="alert" className="mt-4 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-red-700 dark:text-red-300">{mensaje}</p>
}
