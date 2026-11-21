import { render, screen } from '@testing-library/react-native';

import { readConfig } from './config';
import { messages } from './i18n/messages';
import { ConfigErrorScreen } from './screens/ConfigErrorScreen';

describe('messages', () => {
  const english = Object.keys(messages.en).sort();

  it.each(['mr', 'hi'] as const)('%s defines exactly the English keys', (locale) => {
    expect(Object.keys(messages[locale]).sort()).toEqual(english);
  });

  it.each(['en', 'mr', 'hi'] as const)('%s has no empty strings', (locale) => {
    for (const value of Object.values(messages[locale])) {
      expect(value.trim()).not.toBe('');
    }
  });

  it.each(['mr', 'hi'] as const)('%s is translated (Devanagari)', (locale) => {
    expect(messages[locale].homeHeading).toMatch(/[ऀ-ॿ]/);
    expect(messages[locale].statusUnreachable).toMatch(/[ऀ-ॿ]/);
  });
});

describe('readConfig', () => {
  it('accepts and normalises an API origin', () => {
    expect(readConfig(' http://192.168.1.10:8000/ ')).toEqual({
      ok: true,
      apiUrl: 'http://192.168.1.10:8000',
    });
  });

  it.each([undefined, '', '   '])('reports a missing URL (%j)', (value) => {
    expect(readConfig(value)).toEqual({ ok: false, reason: 'EXPO_PUBLIC_API_URL is not set' });
  });

  it.each(['http://192.168.1.10:8000/api/v1', 'ftp://x', 'not a url'])(
    'rejects invalid URL %j',
    (value) => {
      expect(readConfig(value).ok).toBe(false);
    },
  );
});

describe('ConfigErrorScreen', () => {
  it('shows a localized alert without technical details', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await render(<ConfigErrorScreen reason="EXPO_PUBLIC_API_URL is not set" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/not configured correctly/);
    expect(alert).not.toHaveTextContent(/EXPO_PUBLIC/);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('EXPO_PUBLIC_API_URL'));
  });
});
