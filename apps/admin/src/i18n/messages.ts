import type { Locale } from '@konkan/shared-types';

/**
 * Admin UI strings. English is the reference; every locale must define every key (enforced
 * by the `Messages` type and `messages.test.ts`).
 *
 * Marathi and Hindi strings need review by a native speaker before release.
 */
const en = {
  appName: 'Konkan Discovery Admin',
  skipToContent: 'Skip to main content',
  mainNavigation: 'Main navigation',
  navDashboard: 'Dashboard',
  languageLabel: 'Language',
  dashboardTitle: 'Dashboard',
  systemStatusTitle: 'System status',
  statusChecking: 'Checking API status…',
  statusReady: 'API is available',
  statusUnavailable: 'API is running but not ready',
  statusUnreachable: 'Cannot reach the API',
  checkDatabase: 'Database',
  checkPostgis: 'Maps (PostGIS)',
  checkOk: 'OK',
  checkFail: 'Failed',
  retry: 'Check again',
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Readonly<Record<MessageKey, string>>;

const mr: Messages = {
  appName: 'कोकण डिस्कव्हरी प्रशासन',
  skipToContent: 'मुख्य मजकुराकडे जा',
  mainNavigation: 'मुख्य नेव्हिगेशन',
  navDashboard: 'डॅशबोर्ड',
  languageLabel: 'भाषा',
  dashboardTitle: 'डॅशबोर्ड',
  systemStatusTitle: 'प्रणाली स्थिती',
  statusChecking: 'API स्थिती तपासत आहे…',
  statusReady: 'API उपलब्ध आहे',
  statusUnavailable: 'API चालू आहे, पण तयार नाही',
  statusUnreachable: 'API शी संपर्क होऊ शकत नाही',
  checkDatabase: 'डेटाबेस',
  checkPostgis: 'नकाशे (PostGIS)',
  checkOk: 'ठीक',
  checkFail: 'अयशस्वी',
  retry: 'पुन्हा तपासा',
};

const hi: Messages = {
  appName: 'कोंकण डिस्कवरी प्रशासन',
  skipToContent: 'मुख्य सामग्री पर जाएँ',
  mainNavigation: 'मुख्य नेविगेशन',
  navDashboard: 'डैशबोर्ड',
  languageLabel: 'भाषा',
  dashboardTitle: 'डैशबोर्ड',
  systemStatusTitle: 'सिस्टम स्थिति',
  statusChecking: 'API स्थिति जाँची जा रही है…',
  statusReady: 'API उपलब्ध है',
  statusUnavailable: 'API चल रहा है, लेकिन तैयार नहीं है',
  statusUnreachable: 'API से संपर्क नहीं हो पा रहा है',
  checkDatabase: 'डेटाबेस',
  checkPostgis: 'मानचित्र (PostGIS)',
  checkOk: 'ठीक',
  checkFail: 'विफल',
  retry: 'फिर से जाँचें',
};

export const messages: Readonly<Record<Locale, Messages>> = { en, mr, hi };
