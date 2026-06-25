import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HeroUIProvider } from "@heroui/react";
import { WizardFormProvider } from './context/WizardFormContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HeroUIProvider>
      <WizardFormProvider>
        <App />
      </WizardFormProvider>
    </HeroUIProvider>
  </StrictMode>,
)
