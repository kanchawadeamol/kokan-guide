import type { Locale } from '@konkan/shared-types';

/**
 * Public website strings. English is the reference; every locale must define every key
 * (enforced by the `Messages` type and tests). Marathi and Hindi copy needs native-speaker
 * review before launch.
 */
const en = {
  siteName: 'Konkan Discovery',
  metaDescription:
    'Find hospitals, hotels, restaurants, transport and tourist places in Ratnagiri and Raigad districts.',
  skipToContent: 'Skip to main content',
  languageNavLabel: 'Language',
  homeHeading: 'Discover the Konkan coast',
  homeIntro:
    'Local services, businesses and places to visit in Ratnagiri and Raigad, in Marathi, English and Hindi.',
  comingSoon: 'Listings are coming soon.',
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Readonly<Record<MessageKey, string>>;

const mr: Messages = {
  siteName: 'कोकण डिस्कव्हरी',
  metaDescription:
    'रत्नागिरी आणि रायगड जिल्ह्यांतील रुग्णालये, हॉटेल्स, उपाहारगृहे, वाहतूक आणि पर्यटन स्थळे शोधा.',
  skipToContent: 'मुख्य मजकुराकडे जा',
  languageNavLabel: 'भाषा',
  homeHeading: 'कोकण किनारपट्टी शोधा',
  homeIntro:
    'रत्नागिरी आणि रायगडमधील स्थानिक सेवा, व्यवसाय आणि पाहण्यासारखी ठिकाणे — मराठी, इंग्रजी आणि हिंदीमध्ये.',
  comingSoon: 'सूची लवकरच उपलब्ध होईल.',
};

const hi: Messages = {
  siteName: 'कोंकण डिस्कवरी',
  metaDescription: 'रत्नागिरी और रायगड ज़िलों में अस्पताल, होटल, रेस्टोरेंट, परिवहन और पर्यटन स्थल खोजें।',
  skipToContent: 'मुख्य सामग्री पर जाएँ',
  languageNavLabel: 'भाषा',
  homeHeading: 'कोंकण तट की खोज करें',
  homeIntro: 'रत्नागिरी और रायगड की स्थानीय सेवाएँ, व्यवसाय और घूमने की जगहें — मराठी, अंग्रेज़ी और हिंदी में।',
  comingSoon: 'सूचियाँ जल्द ही उपलब्ध होंगी।',
};

export const messages: Readonly<Record<Locale, Messages>> = { en, mr, hi };
