// Import this file in your main.tsx to initialize i18n
import './i18n/config';

// Then wrap your app (if needed, though already configured for React)
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';

// Optional: Add to main.tsx if you need explicit provider
// <I18nextProvider i18n={i18n}>
//   <App />
// </I18nextProvider>

export default i18n;
