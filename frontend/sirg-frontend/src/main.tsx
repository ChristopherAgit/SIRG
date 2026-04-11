import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './admin/components/toast/ToastContext'
import { ToastViewport } from './admin/components/toast/ToastViewport'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <ToastProvider>
          <App />
          <ToastViewport />
        </ToastProvider>
  </StrictMode>,
)
