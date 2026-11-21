import axios from 'axios'

import { useNotificationStore } from '@/store/notificationStore'


interface ErrorValidacion {
  msg?: string
  loc?: (string | number)[]
}


export function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string,
): Promise<string> {
  if (!axios.isAxiosError(error)) {
    return Promise.resolve(mensajePredeterminado)
  }

  const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail
  if (typeof detail === 'string') return Promise.resolve(detail)
  if (Array.isArray(detail)) {
    const errores = detail as ErrorValidacion[]
    return Promise.resolve(
      errores.map((item) =>
        `${item.loc?.slice(1).join('.') || 'Datos'}: ${item.msg ?? mensajePredeterminado}`,
      ).join('; '),
    )
  }
  if (error.code === 'ECONNABORTED') {
    return Promise.resolve('La solicitud tardó demasiado. Intente nuevamente.')
  }
  return Promise.resolve(mensajePredeterminado)
}


export function obtenerEstadoHttp(error: unknown): number | undefined {
  const original = error instanceof Error && error.cause ? error.cause : error
  return axios.isAxiosError(original) ? original.response?.status : undefined
}

export function notificarError(error: unknown) {
  const status = obtenerEstadoHttp(error)
  if (status === 401 || status === 403) return

  const message = error instanceof Error && !axios.isAxiosError(error)
    ? error.message
    : 'No se pudo completar la operación.'
  useNotificationStore.getState().showNotification(message)
}
