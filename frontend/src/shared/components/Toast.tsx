import { useEffect } from 'react'

import { useNotificationStore } from '@/store/notificationStore'

export default function Toast() {
  const { message, visible, notificationId, hideNotification } = useNotificationStore()

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(hideNotification, 3000)
    return () => window.clearTimeout(timer)
  }, [visible, notificationId, hideNotification])

  return (
    <div role="status" className="pointer-events-none fixed right-4 bottom-4 z-60 max-w-sm">
      {visible && (
        <p className="rounded-lg bg-slate-900 px-4 py-3 text-white shadow-lg dark:bg-slate-200 dark:text-slate-900">
          {message}
        </p>
      )}
    </div>
  )
}
