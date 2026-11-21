import { describe, expect, it } from 'vitest';

import { readConfig } from './config';
import { messages } from './i18n/messages';
import { installTheme } from './theme/themeCss';

describe('messages', () => {
  const english = Object.keys(messages.en).sort();

  it.each(['mr', 'hi'] as const)('%s defines exactly the English keys', (locale) => {
    expect(Object.keys(messages[locale]).sort()).toEqual(english);
  });

  it.each(['en', 'mr', 'hi'] as const)('%s has no empty strings', (locale) => {
    for (const [key, value] of Object.entries(messages[locale])) {
      expect(value.trim(), `${locale}.${key}`).not.toBe('');
    }
  });

  it.each(['mr', 'hi'] as const)('%s is actually translated (Devanagari text)', (locale) => {
    expect(messages[locale].appName).toMatch(/[ऀ-ॿ]/);
    expect(messages[locale].skipToContent).toMatch(/[ऀ-ॿ]/);
  });
});

describe('installTheme', () => {
  it('installs the shared stylesheet exactly once', () => {
    installTheme(document);
    installTheme(document);

    const styles = document.querySelectorAll('style#konkan-theme');
    expect(styles).toHaveLength(1);
    expect(styles[0]!.textContent).toContain('@media (prefers-color-scheme: dark)');
  });
});

describe('readConfig', () => {
  it('normalises the API origin', () => {
    expect(readConfig({ VITE_API_URL: ' http://127.0.0.1:8000/ ' })).toEqual({
      apiUrl: 'http://127.0.0.1:8000',
    });
  });

  it.each([{}, { VITE_API_URL: '' }, { VITE_API_URL: 42 }])('fails fast for %j', (env) => {
    expect(() => readConfig(env)).toThrow(/VITE_API_URL is not set/);
  });

  it('rejects an API URL that includes /api/v1', () => {
    expect(() => readConfig({ VITE_API_URL: 'http://127.0.0.1:8000/api/v1' })).toThrow(TypeError);
  });
});
