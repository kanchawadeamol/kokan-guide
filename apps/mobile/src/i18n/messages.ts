import type { Locale } from '@konkan/shared-types';

/**
 * Mobile UI strings. English is the reference; every locale must define every key (enforced
 * by the `Messages` type and tests). Marathi and Hindi need native-speaker review.
 */
const en = {
  appName: 'Konkan Discovery',
  homeHeading: 'Discover the Konkan coast',
  homeIntro: 'Local services, businesses and places to visit in Ratnagiri and Raigad.',
  languageLabel: 'Language',
  systemStatusTitle: 'Service status',
  statusChecking: 'Checking connection…',
  statusReady: 'Connected',
  statusUnavailable: 'Service is temporarily unavailable',
  statusUnreachable: 'Cannot connect. Check your internet connection.',
  retry: 'Try again',
  configError: 'The app is not configured correctly. Please update or reinstall it.',
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Readonly<Record<MessageKey, string>>;

const mr: Messages = {
  appName: 'कोकण डिस्कव्हरी',
  homeHeading: 'कोकण किनारपट्टी शोधा',
  homeIntro: 'रत्नागिरी आणि रायगडमधील स्थानिक सेवा, व्यवसाय आणि पाहण्यासारखी ठिकाणे.',
  languageLabel: 'भाषा',
  systemStatusTitle: 'सेवा स्थिती',
  statusChecking: 'जोडणी तपासत आहे…',
  statusReady: 'जोडलेले',
  statusUnavailable: 'सेवा तात्पुरती उपलब्ध नाही',
  statusUnreachable: 'जोडणी होऊ शकत नाही. तुमचे इंटरनेट कनेक्शन तपासा.',
  retry: 'पुन्हा प्रयत्न करा',
  configError: 'ॲप योग्यरित्या कॉन्फिगर केलेले नाही. कृपया ते अपडेट किंवा पुन्हा इंस्टॉल करा.',
};

const hi: Messages = {
  appName: 'कोंकण डिस्कवरी',
  homeHeading: 'कोंकण तट की खोज करें',
  homeIntro: 'रत्नागिरी और रायगड की स्थानीय सेवाएँ, व्यवसाय और घूमने की जगहें।',
  languageLabel: 'भाषा',
  systemStatusTitle: 'सेवा स्थिति',
  statusChecking: 'कनेक्शन जाँचा जा रहा है…',
  statusReady: 'कनेक्ट है',
  statusUnavailable: 'सेवा अस्थायी रूप से उपलब्ध नहीं है',
  statusUnreachable: 'कनेक्ट नहीं हो पा रहा है। अपना इंटरनेट कनेक्शन जाँचें।',
  retry: 'फिर से प्रयास करें',
  configError: 'ऐप सही तरह से कॉन्फ़िगर नहीं है। कृपया इसे अपडेट या फिर से इंस्टॉल करें।',
};

export const messages: Readonly<Record<Locale, Messages>> = { en, mr, hi };
