import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n/i18n';
import './index.css';

import { themeEngine } from './engine/ThemeEngine';

const queryClient = new QueryClient();

async function bootstrap() {
  // 1. Initialize theme engine first (before React mounts)
  // This prevents flash of wrong colors/fonts
  await themeEngine.initialize();

  // 2. Render the app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorBoundary>
            <SettingsProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </SettingsProvider>
          </ErrorBoundary>
          <Toaster 
            position="top-center" 
            toastOptions={{
              duration: 3000,
              style: {
                fontSize: '13px',
                borderRadius: '12px',
                maxWidth: '340px',
                fontWeight: '600',
              }
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

bootstrap();
