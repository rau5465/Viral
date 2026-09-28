import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Globally capture PWA beforeinstallprompt event for post-signup prompt & install banner
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__farDeferredInstallPrompt = e;
  window.dispatchEvent(new Event('far-pwa-prompt-ready'));
});

window.addEventListener('appinstalled', () => {
  window.__farDeferredInstallPrompt = null;
  window.__farAppIsInstalled = true;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

