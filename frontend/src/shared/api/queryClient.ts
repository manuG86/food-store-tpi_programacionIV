import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { notificarError, obtenerEstadoHttp } from '@/shared/api/errores'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: notificarError }),
  mutationCache: new MutationCache({ onError: notificarError }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = obtenerEstadoHttp(error)
        return (status === undefined || status >= 500) && failureCount < 3
      },
    },
  },
})
