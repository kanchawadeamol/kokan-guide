import './styles/global.css';

import { createApiClient } from '@konkan/api-client';
import { resolveLocale } from '@konkan/shared-types';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ApiClientProvider } from './api/ApiClientProvider';
import { App } from './App';
import { readConfig } from './config';
import { I18nProvider } from './i18n/I18nProvider';
import { installTheme } from './theme/themeCss';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

installTheme();

const config = readConfig(import.meta.env);
const client = createApiClient({
  baseUrl: config.apiUrl,
  // I18nProvider keeps <html lang> in sync with the selected language.
  locale: () => resolveLocale([document.documentElement.lang]),
});

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <ApiClientProvider client={client}>
        <App />
      </ApiClientProvider>
    </I18nProvider>
  </StrictMode>,
);
