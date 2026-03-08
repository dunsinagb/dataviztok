import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LikedDashboardsProvider } from './contexts/LikedDashboardsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LikedDashboardsProvider>
      <App />
    </LikedDashboardsProvider>
  </StrictMode>,
)
