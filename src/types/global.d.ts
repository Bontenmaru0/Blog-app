export {}

// sweetalert2 toast
declare global {
  interface Window {
    showToast: (title: string, text: string, type: 'success' | 'error' | 'info' | 'warning') => void
  }
}

// bootstrap
declare global {
  interface Window {
    bootstrap: any
  }
}