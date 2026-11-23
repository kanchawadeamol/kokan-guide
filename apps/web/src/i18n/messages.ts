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
  searchLabel: 'Search places and services',
  searchPlaceholder: 'Try “hospital Dapoli” or “beach”',
  searchButton: 'Search',
  categoriesHeading: 'Browse by category',
  popularHeading: 'Popular places',
  breadcrumbLabel: 'Breadcrumb',
  home: 'Home',
  listingsCount: '{count} listings',
  listingsCountOne: '{count} listing',
  emptyCategory: 'No sample listings in this category yet.',
  searchHeading: 'Search results',
  resultsFor: '{count} results for “{query}”',
  noResults: 'No results for “{query}”. Try another place or service.',
  searchPrompt: 'Type a place or service to search.',
  openNow: 'Open now',
  closedNow: 'Closed now',
  open24h: 'Open 24 hours',
  closed: 'Closed',
  hoursUnknown: 'Opening hours not available',
  hoursHeading: 'Opening hours',
  addressHeading: 'Address',
  contactHeading: 'Contact',
  aboutHeading: 'About',
  call: 'Call',
  whatsapp: 'WhatsApp',
  directions: 'Directions',
  reportIncorrect: 'Report incorrect information',
  disabledInPreview: 'Disabled for sample data',
  noContact: 'No contact details for this place.',
  verified: 'Verified',
  pending: 'Verification pending',
  unverified: 'Not verified',
  landmarkNote: 'Public place. Details will be confirmed from official sources.',
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
  searchLabel: 'ठिकाणे आणि सेवा शोधा',
  searchPlaceholder: '“रुग्णालय दापोली” किंवा “समुद्रकिनारा” शोधा',
  searchButton: 'शोधा',
  categoriesHeading: 'श्रेणीनुसार पाहा',
  popularHeading: 'लोकप्रिय ठिकाणे',
  breadcrumbLabel: 'मार्गदर्शक',
  home: 'मुख्यपृष्ठ',
  listingsCount: '{count} नोंदी',
  listingsCountOne: '{count} नोंद',
  emptyCategory: 'या श्रेणीत अद्याप नमुना नोंदी नाहीत.',
  searchHeading: 'शोध परिणाम',
  resultsFor: '“{query}” साठी {count} परिणाम',
  noResults: '“{query}” साठी परिणाम नाहीत. दुसरे ठिकाण किंवा सेवा शोधा.',
  searchPrompt: 'शोधण्यासाठी ठिकाण किंवा सेवा लिहा.',
  openNow: 'आता सुरू',
  closedNow: 'आता बंद',
  open24h: '२४ तास सुरू',
  closed: 'बंद',
  hoursUnknown: 'वेळ उपलब्ध नाही',
  hoursHeading: 'वेळ',
  addressHeading: 'पत्ता',
  contactHeading: 'संपर्क',
  aboutHeading: 'माहिती',
  call: 'कॉल करा',
  whatsapp: 'व्हॉट्सॲप',
  directions: 'दिशा',
  reportIncorrect: 'चुकीची माहिती कळवा',
  disabledInPreview: 'नमुना माहितीसाठी बंद',
  noContact: 'या ठिकाणासाठी संपर्क माहिती नाही.',
  verified: 'सत्यापित',
  pending: 'सत्यापन प्रलंबित',
  unverified: 'सत्यापित नाही',
  landmarkNote: 'सार्वजनिक ठिकाण. तपशील अधिकृत स्रोतांकडून निश्चित केले जातील.',
};

const hi: Messages = {
  siteName: 'कोंकण डिस्कवरी',
  metaDescription: 'रत्नागिरी और रायगड ज़िलों में अस्पताल, होटल, रेस्टोरेंट, परिवहन और पर्यटन स्थल खोजें।',
  skipToContent: 'मुख्य सामग्री पर जाएँ',
  languageNavLabel: 'भाषा',
  homeHeading: 'कोंकण तट की खोज करें',
  homeIntro: 'रत्नागिरी और रायगड की स्थानीय सेवाएँ, व्यवसाय और घूमने की जगहें — मराठी, अंग्रेज़ी और हिंदी में।',
  searchLabel: 'जगहें और सेवाएँ खोजें',
  searchPlaceholder: '“अस्पताल दापोली” या “समुद्र तट” खोजें',
  searchButton: 'खोजें',
  categoriesHeading: 'श्रेणी के अनुसार देखें',
  popularHeading: 'लोकप्रिय जगहें',
  breadcrumbLabel: 'ब्रेडक्रम्ब',
  home: 'होम',
  listingsCount: '{count} सूचियाँ',
  listingsCountOne: '{count} सूची',
  emptyCategory: 'इस श्रेणी में अभी कोई नमूना सूची नहीं है।',
  searchHeading: 'खोज परिणाम',
  resultsFor: '“{query}” के लिए {count} परिणाम',
  noResults: '“{query}” के लिए कोई परिणाम नहीं। कोई और जगह या सेवा खोजें।',
  searchPrompt: 'खोजने के लिए जगह या सेवा लिखें।',
  openNow: 'अभी खुला',
  closedNow: 'अभी बंद',
  open24h: '24 घंटे खुला',
  closed: 'बंद',
  hoursUnknown: 'समय उपलब्ध नहीं',
  hoursHeading: 'खुलने का समय',
  addressHeading: 'पता',
  contactHeading: 'संपर्क',
  aboutHeading: 'जानकारी',
  call: 'कॉल करें',
  whatsapp: 'व्हाट्सएप',
  directions: 'रास्ता',
  reportIncorrect: 'गलत जानकारी की रिपोर्ट करें',
  disabledInPreview: 'नमूना डेटा के लिए बंद',
  noContact: 'इस जगह के लिए संपर्क जानकारी नहीं है।',
  verified: 'सत्यापित',
  pending: 'सत्यापन लंबित',
  unverified: 'सत्यापित नहीं',
  landmarkNote: 'सार्वजनिक स्थान। विवरण आधिकारिक स्रोतों से पुष्टि किए जाएँगे।',
};

export const messages: Readonly<Record<Locale, Messages>> = { en, mr, hi };

/** Replace `{name}` placeholders, e.g. format(t.resultsFor, { count: 3, query: 'x' }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** "{count} listing" vs "{count} listings", using each language's plural rules. */
export function listingsLabel(t: Messages, bcp47: string, count: number): string {
  const one = new Intl.PluralRules(bcp47).select(count) === 'one';
  return format(one ? t.listingsCountOne : t.listingsCount, { count });
}
