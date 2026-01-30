import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-day-picker/dist/style.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import { StoreProvider } from './context/StoreProvider.jsx'

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <StoreProvider>
      <App />
      <Toaster position='top-right'/>
    </StoreProvider>
  </StrictMode>,

)
