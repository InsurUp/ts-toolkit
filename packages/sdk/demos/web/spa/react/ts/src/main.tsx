import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/auth';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <NuqsAdapter>
          <App />
          <Toaster />
        </NuqsAdapter>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
