import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import App from './App';
import { LanguageProvider } from './i18n';
import './index.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const root = createRoot(document.getElementById('root')!);

if (!convexUrl) {
  root.render(
    <p style={{ padding: 24, fontFamily: 'system-ui' }}>
      Missing <code>VITE_CONVEX_URL</code>. Run <code>npx convex dev</code> to create <code>.env.local</code>.
    </p>,
  );
} else {
  root.render(
    <StrictMode>
      <ConvexProvider client={new ConvexReactClient(convexUrl)}>
        <LanguageProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
          </BrowserRouter>
        </LanguageProvider>
      </ConvexProvider>
    </StrictMode>,
  );
}
