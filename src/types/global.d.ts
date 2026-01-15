export {}

declare global {
  interface Window {
    showToast: (title: string, text: string, type: 'success' | 'error' | 'info' | 'warning') => void
  }
}