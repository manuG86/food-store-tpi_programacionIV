import { create } from 'zustand'

interface NotificationState {
  message: string
  visible: boolean
  notificationId: number
  showNotification: (message: string) => void
  hideNotification: () => void
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  message: '',
  visible: false,
  notificationId: 0,
  showNotification: (message) => set((state) => ({
    message,
    visible: true,
    notificationId: state.notificationId + 1,
  })),
  hideNotification: () => set({ message: '', visible: false }),
}))
