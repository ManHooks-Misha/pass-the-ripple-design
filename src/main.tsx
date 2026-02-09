import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/main.scss'
import '@fontsource-variable/nunito'
import { loadConfig } from './config/runtime-config'

// Load runtime configuration before rendering the app
loadConfig()
  .then(() => {
    // Configuration loaded successfully, render the app
    createRoot(document.getElementById("root")!).render(<App />);
  })
  .catch((error) => {
    // Even if config loading fails, still render the app with fallback config
    console.error('Failed to load runtime config, using fallback:', error);
    createRoot(document.getElementById("root")!).render(<App />);
  });
