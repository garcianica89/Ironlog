import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Register Service Worker for PWA mobile installability and offline support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('IronLog: Service Worker activo en:', reg.scope);
      })
      .catch((err) => {
        console.warn('IronLog: Registro de SW:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
