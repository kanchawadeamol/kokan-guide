import type { SamplePlace, Translations } from './types';

/**
 * Towns used by the sample listings. Slugs and English/Marathi names match the database seed
 * (apps/backend/app/seed/regions.json). Hindi spellings are preview-only and need review.
 */
const RATNAGIRI: Translations = { en: 'Ratnagiri', mr: 'रत्नागिरी', hi: 'रत्नागिरी' };
const RAIGAD: Translations = { en: 'Raigad', mr: 'रायगड', hi: 'रायगड' };

function ratnagiri(slug: string, taluka: string, name: Translations): SamplePlace {
  return { slug, taluka, district: 'ratnagiri', name, districtName: RATNAGIRI };
}

function raigad(slug: string, taluka: string, name: Translations): SamplePlace {
  return { slug, taluka, district: 'raigad', name, districtName: RAIGAD };
}

export const places: readonly SamplePlace[] = [
  ratnagiri('mandangad', 'mandangad', { en: 'Mandangad', mr: 'मंडणगड', hi: 'मंडणगड' }),
  ratnagiri('dapoli', 'dapoli', { en: 'Dapoli', mr: 'दापोली', hi: 'दापोली' }),
  ratnagiri('harnai', 'dapoli', { en: 'Harnai', mr: 'हर्णै', hi: 'हर्णै' }),
  ratnagiri('khed', 'khed', { en: 'Khed', mr: 'खेड', hi: 'खेड' }),
  ratnagiri('chiplun', 'chiplun', { en: 'Chiplun', mr: 'चिपळूण', hi: 'चिपलून' }),
  ratnagiri('velneshwar', 'guhagar', { en: 'Velneshwar', mr: 'वेळणेश्वर', hi: 'वेलणेश्वर' }),
  ratnagiri('ratnagiri', 'ratnagiri', { en: 'Ratnagiri', mr: 'रत्नागिरी', hi: 'रत्नागिरी' }),
  ratnagiri('ganpatipule', 'ratnagiri', { en: 'Ganpatipule', mr: 'गणपतीपुळे', hi: 'गणपतिपुले' }),
  ratnagiri('rajapur', 'rajapur', { en: 'Rajapur', mr: 'राजापूर', hi: 'राजापुर' }),
  raigad('alibag', 'alibag', { en: 'Alibag', mr: 'अलिबाग', hi: 'अलीबाग' }),
  raigad('panvel', 'panvel', { en: 'Panvel', mr: 'पनवेल', hi: 'पनवेल' }),
  raigad('matheran', 'karjat', { en: 'Matheran', mr: 'माथेरान', hi: 'माथेरान' }),
  raigad('murud', 'murud', { en: 'Murud', mr: 'मुरुड', hi: 'मुरुड' }),
  raigad('kashid', 'murud', { en: 'Kashid', mr: 'काशीद', hi: 'काशीद' }),
  raigad('harihareshwar', 'shrivardhan', {
    en: 'Harihareshwar',
    mr: 'हरिहरेश्वर',
    hi: 'हरिहरेश्वर',
  }),
  raigad('diveagar', 'shrivardhan', { en: 'Diveagar', mr: 'दिवेआगर', hi: 'दिवेआगर' }),
  raigad('mahad', 'mahad', { en: 'Mahad', mr: 'महाड', hi: 'महाड' }),
];
