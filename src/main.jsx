import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SubscriptionProvider } from './context/SubscriptionContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SubscriptionProvider>
        <App />
      </SubscriptionProvider>
    </AuthProvider>
  </StrictMode>,
)

