import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/shared/api/queryClient'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import '@/shared/api/setupInterceptors'
import App from './App'
import './index.css'


useAuthStore.subscribe((estado, anterior) => {
  if (anterior.user && anterior.user.id !== estado.user?.id) {
    queryClient.removeQueries({ queryKey: ['pedidos'] })
    queryClient.removeQueries({ queryKey: ['admin', 'usuarios'] })
  }
})

document.documentElement.classList.toggle('dark', useThemeStore.getState().darkMode)
useThemeStore.subscribe(({ darkMode }) => {
  document.documentElement.classList.toggle('dark', darkMode)
})


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
