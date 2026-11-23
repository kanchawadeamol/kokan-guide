import type { OpeningPeriod, SampleListing, Translations } from './types';

/*
 * Sample listings for UI previews.
 *
 * - Fictional businesses: names contain "(Sample)", phones are placeholders in the invalid
 *   range "+91 00000 NNNNN", and hours are invented. They exist only to show the design.
 * - Public landmarks are real places with short generic descriptions only. No phone numbers
 *   or opening hours are given, because inventing those for real places would mislead people.
 */

const days = [0, 1, 2, 3, 4, 5, 6] as const;

function everyDay(open: string, close: string): OpeningPeriod[] {
  return days.map((day) => ({ day, open, close }));
}

function monToSat(open: string, close: string): OpeningPeriod[] {
  return days.filter((d) => d !== 0).map((day) => ({ day, open, close }));
}

function sampleName(en: string, mr: string, hi: string): Translations {
  return { en: `${en} (Sample)`, mr: `${mr} (नमुना)`, hi: `${hi} (नमूना)` };
}

function business(
  slug: string,
  categorySlug: string,
  placeSlug: string,
  index: number,
  name: Translations,
  description: Translations,
  hours: OpeningPeriod[],
  verification: SampleListing['verification'],
  extra: Partial<Pick<SampleListing, 'popular' | 'hasWhatsApp'>> = {},
): SampleListing {
  return {
    slug,
    kind: 'fictional-business',
    categorySlug,
    placeSlug,
    name,
    description,
    addressLine: {
      en: 'Sample address, main road',
      mr: 'नमुना पत्ता, मुख्य रस्ता',
      hi: 'नमूना पता, मुख्य सड़क',
    },
    phone: `+91 00000 ${String(index).padStart(5, '0')}`,
    hasWhatsApp: extra.hasWhatsApp ?? true,
    hours,
    verification,
    popular: extra.popular ?? false,
  };
}

function landmark(
  slug: string,
  categorySlug: string,
  placeSlug: string,
  name: Translations,
  description: Translations,
): SampleListing {
  return {
    slug,
    kind: 'public-landmark',
    categorySlug,
    placeSlug,
    name,
    description,
    addressLine: null,
    phone: null,
    hasWhatsApp: false,
    hours: null,
    verification: 'unverified',
    popular: true,
  };
}

export const listings: readonly SampleListing[] = [
  // ---------------------------------------------------------------- fictional businesses
  business(
    'sample-care-hospital-chiplun',
    'hospitals',
    'chiplun',
    1,
    sampleName('Care Hospital', 'केअर रुग्णालय', 'केयर अस्पताल'),
    {
      en: 'Multi-speciality hospital with a 24-hour emergency ward.',
      mr: '२४ तास आपत्कालीन विभाग असलेले बहुविशेष रुग्णालय.',
      hi: '24 घंटे आपातकालीन वार्ड वाला मल्टी-स्पेशियलिटी अस्पताल।',
    },
    everyDay('00:00', '23:59'),
    'verified',
  ),
  business(
    'sample-coastal-hospital-alibag',
    'hospitals',
    'alibag',
    2,
    sampleName('Coastal Hospital', 'कोस्टल रुग्णालय', 'कोस्टल अस्पताल'),
    {
      en: 'General hospital with outpatient and inpatient care.',
      mr: 'बाह्यरुग्ण आणि आंतररुग्ण सेवा असलेले सामान्य रुग्णालय.',
      hi: 'ओपीडी और भर्ती सुविधा वाला सामान्य अस्पताल।',
    },
    everyDay('00:00', '23:59'),
    'pending',
  ),
  business(
    'sample-family-clinic-dapoli',
    'clinics',
    'dapoli',
    3,
    sampleName('Family Clinic', 'फॅमिली दवाखाना', 'फैमिली क्लिनिक'),
    {
      en: 'General physician for families and children.',
      mr: 'कुटुंब आणि मुलांसाठी सामान्य डॉक्टर.',
      hi: 'परिवारों और बच्चों के लिए सामान्य चिकित्सक।',
    },
    monToSat('09:30', '19:30'),
    'verified',
  ),
  business(
    'sample-child-clinic-ratnagiri',
    'clinics',
    'ratnagiri',
    4,
    sampleName('Child Clinic', 'बाल दवाखाना', 'बाल क्लिनिक'),
    {
      en: 'Paediatric clinic.',
      mr: 'लहान मुलांचा दवाखाना.',
      hi: 'बच्चों का क्लिनिक।',
    },
    monToSat('10:00', '18:00'),
    'unverified',
  ),
  business(
    'sample-medicals-mandangad',
    'medical-stores',
    'mandangad',
    5,
    sampleName('Medicals', 'मेडिकल', 'मेडिकल'),
    {
      en: 'Pharmacy for prescriptions and everyday medicines.',
      mr: 'प्रिस्क्रिप्शन आणि नेहमीच्या औषधांसाठी औषधालय.',
      hi: 'पर्चे और रोज़मर्रा की दवाओं के लिए दवा दुकान।',
    },
    everyDay('08:00', '22:00'),
    'verified',
  ),
  business(
    'sample-pharmacy-panvel',
    'medical-stores',
    'panvel',
    6,
    sampleName('Pharmacy', 'फार्मसी', 'फार्मेसी'),
    {
      en: 'Neighbourhood pharmacy.',
      mr: 'परिसरातील औषधालय.',
      hi: 'मोहल्ले की दवा दुकान।',
    },
    everyDay('09:00', '21:00'),
    'pending',
  ),
  business(
    'sample-sea-view-stay-ganpatipule',
    'hotels',
    'ganpatipule',
    7,
    sampleName('Sea View Stay', 'सी व्ह्यू स्टे', 'सी व्यू स्टे'),
    {
      en: 'Family-friendly rooms close to the beach.',
      mr: 'समुद्रकिनाऱ्याजवळ कुटुंबासाठी योग्य खोल्या.',
      hi: 'समुद्र तट के पास परिवार के लिए उपयुक्त कमरे।',
    },
    everyDay('00:00', '23:59'),
    'verified',
    { popular: true },
  ),
  business(
    'sample-beach-resort-kashid',
    'hotels',
    'kashid',
    8,
    sampleName('Beach Resort', 'बीच रिसॉर्ट', 'बीच रिसॉर्ट'),
    {
      en: 'Cottages with a garden near the coast.',
      mr: 'किनाऱ्याजवळ बाग असलेले कॉटेज.',
      hi: 'तट के पास बगीचे वाले कॉटेज।',
    },
    everyDay('00:00', '23:59'),
    'unverified',
  ),
  business(
    'sample-konkan-kitchen-dapoli',
    'restaurants',
    'dapoli',
    9,
    sampleName('Konkan Kitchen', 'कोकण किचन', 'कोंकण किचन'),
    {
      en: 'Family restaurant serving home-style Konkan meals.',
      mr: 'घरगुती कोकणी जेवण देणारे कौटुंबिक उपाहारगृह.',
      hi: 'घर जैसा कोंकणी खाना परोसने वाला फैमिली रेस्टोरेंट।',
    },
    everyDay('11:00', '22:30'),
    'verified',
    { popular: true },
  ),
  business(
    'sample-seafood-corner-alibag',
    'restaurants',
    'alibag',
    10,
    sampleName('Seafood Corner', 'सीफूड कॉर्नर', 'सीफूड कॉर्नर'),
    {
      en: 'Fresh fish thalis and snacks.',
      mr: 'ताज्या माशांची थाळी आणि नाश्ता.',
      hi: 'ताज़ी मछली की थाली और नाश्ता।',
    },
    everyDay('12:00', '23:00'),
    'pending',
  ),
  business(
    'sample-auto-stand-ratnagiri',
    'auto-drivers',
    'ratnagiri',
    11,
    sampleName('Auto Stand', 'रिक्षा थांबा', 'ऑटो स्टैंड'),
    {
      en: 'Shared and private auto rickshaws.',
      mr: 'शेअर आणि खासगी रिक्षा.',
      hi: 'शेयर और निजी ऑटो रिक्शा।',
    },
    everyDay('06:00', '22:00'),
    'unverified',
  ),
  business(
    'sample-taxi-service-mahad',
    'taxi-services',
    'mahad',
    12,
    sampleName('Taxi Service', 'टॅक्सी सेवा', 'टैक्सी सेवा'),
    {
      en: 'Local and outstation taxis.',
      mr: 'स्थानिक आणि बाहेरगावी टॅक्सी.',
      hi: 'स्थानीय और बाहर जाने के लिए टैक्सी।',
    },
    everyDay('05:00', '23:00'),
    'verified',
  ),
  business(
    'sample-local-produce-rajapur',
    'shopping',
    'rajapur',
    13,
    sampleName('Local Produce Store', 'स्थानिक उत्पादन दुकान', 'स्थानीय उत्पाद स्टोर'),
    {
      en: 'Kokum, cashews and other local products.',
      mr: 'कोकम, काजू आणि इतर स्थानिक उत्पादने.',
      hi: 'कोकम, काजू और अन्य स्थानीय उत्पाद।',
    },
    monToSat('09:00', '20:00'),
    'pending',
  ),
  business(
    'sample-electrician-khed',
    'local-services',
    'khed',
    14,
    sampleName('Electrician', 'इलेक्ट्रिशियन', 'इलेक्ट्रीशियन'),
    {
      en: 'Home wiring and appliance repairs.',
      mr: 'घरगुती वायरिंग आणि उपकरण दुरुस्ती.',
      hi: 'घर की वायरिंग और उपकरण मरम्मत।',
    },
    monToSat('08:30', '19:00'),
    'unverified',
    { hasWhatsApp: false },
  ),

  // ---------------------------------------------------------------- real public landmarks
  landmark(
    'ganpatipule-beach',
    'beaches',
    'ganpatipule',
    { en: 'Ganpatipule Beach', mr: 'गणपतीपुळे समुद्रकिनारा', hi: 'गणपतिपुले समुद्र तट' },
    {
      en: 'Beach on the Ratnagiri coast.',
      mr: 'रत्नागिरी किनारपट्टीवरील समुद्रकिनारा.',
      hi: 'रत्नागिरी तट पर समुद्र तट।',
    },
  ),
  landmark(
    'ganpatipule-temple',
    'temples',
    'ganpatipule',
    { en: 'Ganpatipule Temple', mr: 'गणपतीपुळे मंदिर', hi: 'गणपतिपुले मंदिर' },
    {
      en: 'Ganesh temple beside the beach.',
      mr: 'समुद्रकिनाऱ्याजवळील गणपती मंदिर.',
      hi: 'समुद्र तट के पास गणेश मंदिर।',
    },
  ),
  landmark(
    'velneshwar-beach',
    'beaches',
    'velneshwar',
    { en: 'Velneshwar Beach', mr: 'वेळणेश्वर समुद्रकिनारा', hi: 'वेलणेश्वर समुद्र तट' },
    {
      en: 'Beach in Guhagar taluka.',
      mr: 'गुहागर तालुक्यातील समुद्रकिनारा.',
      hi: 'गुहागर तालुका का समुद्र तट।',
    },
  ),
  landmark(
    'suvarnadurg-fort',
    'forts',
    'harnai',
    { en: 'Suvarnadurg Fort', mr: 'सुवर्णदुर्ग किल्ला', hi: 'सुवर्णदुर्ग किला' },
    {
      en: 'Sea fort off the coast near Harnai.',
      mr: 'हर्णैजवळील समुद्रातील जलदुर्ग.',
      hi: 'हर्णै के पास समुद्र में स्थित किला।',
    },
  ),
  landmark(
    'kolaba-fort',
    'forts',
    'alibag',
    { en: 'Kolaba Fort', mr: 'कुलाबा किल्ला', hi: 'कोलाबा किला' },
    {
      en: 'Sea fort near Alibag beach.',
      mr: 'अलिबाग समुद्रकिनाऱ्याजवळील जलदुर्ग.',
      hi: 'अलीबाग समुद्र तट के पास समुद्री किला।',
    },
  ),
  landmark(
    'murud-janjira-fort',
    'forts',
    'murud',
    { en: 'Murud-Janjira Fort', mr: 'मुरुड-जंजिरा किल्ला', hi: 'मुरुड-जंजीरा किला' },
    {
      en: 'Island fort near Murud.',
      mr: 'मुरुडजवळील बेटावरील किल्ला.',
      hi: 'मुरुड के पास द्वीप पर स्थित किला।',
    },
  ),
  landmark(
    'kashid-beach',
    'beaches',
    'kashid',
    { en: 'Kashid Beach', mr: 'काशीद समुद्रकिनारा', hi: 'काशीद समुद्र तट' },
    {
      en: 'Beach in Murud taluka.',
      mr: 'मुरुड तालुक्यातील समुद्रकिनारा.',
      hi: 'मुरुड तालुका का समुद्र तट।',
    },
  ),
  landmark(
    'diveagar-beach',
    'beaches',
    'diveagar',
    { en: 'Diveagar Beach', mr: 'दिवेआगर समुद्रकिनारा', hi: 'दिवेआगर समुद्र तट' },
    {
      en: 'Beach in Shrivardhan taluka.',
      mr: 'श्रीवर्धन तालुक्यातील समुद्रकिनारा.',
      hi: 'श्रीवर्धन तालुका का समुद्र तट।',
    },
  ),
  landmark(
    'harihareshwar-temple',
    'temples',
    'harihareshwar',
    { en: 'Harihareshwar Temple', mr: 'हरिहरेश्वर मंदिर', hi: 'हरिहरेश्वर मंदिर' },
    {
      en: 'Temple on the Shrivardhan coast.',
      mr: 'श्रीवर्धन किनारपट्टीवरील मंदिर.',
      hi: 'श्रीवर्धन तट पर स्थित मंदिर।',
    },
  ),
  landmark(
    'matheran',
    'tourist-places',
    'matheran',
    { en: 'Matheran', mr: 'माथेरान', hi: 'माथेरान' },
    {
      en: 'Hill station in Karjat taluka.',
      mr: 'कर्जत तालुक्यातील थंड हवेचे ठिकाण.',
      hi: 'कर्जत तालुका का हिल स्टेशन।',
    },
  ),
];
