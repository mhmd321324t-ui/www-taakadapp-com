import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme before render to prevent flash
const savedTheme = localStorage.getItem('almuadhin_theme');
const theme = (savedTheme === 'light') ? 'light' : 'dark';
document.documentElement.classList.add(theme);
if (theme === 'dark') document.documentElement.classList.remove('light');
else document.documentElement.classList.remove('dark');

// Register service worker for notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-custom.js', { scope: '/' })
      .then(reg => {
        console.log('Service Worker registered:', reg.scope);
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('New Service Worker activated');
              }
            });
          }
        });
      })
      .catch(err => console.error('SW registration failed:', err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
