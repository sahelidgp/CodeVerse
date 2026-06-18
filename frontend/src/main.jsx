import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { ClerkProvider } from "@clerk/clerk-react";
const VITE_CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  if(!VITE_CLERK_PUBLISHABLE_KEY){
    throw new Error('Missing Publishable key');
    
  }
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={VITE_CLERK_PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
