import type { Translations } from './types';

/**
 * Districts and talukas for form pickers. Slugs and English/Marathi names mirror the database
 * seed (apps/backend/app/seed/regions.json). Hindi place names are not seeded yet, so they fall
 * back to the Marathi (Devanagari) spelling, as ADR 0003 specifies for place names.
 */
export interface RegionOption {
  slug: string;
  name: Translations;
}

export interface DistrictOption extends RegionOption {
  talukas: readonly RegionOption[];
}

function place(slug: string, en: string, mr: string): RegionOption {
  return { slug, name: { en, mr, hi: mr } };
}

export const districts: readonly DistrictOption[] = [
  {
    ...place('ratnagiri', 'Ratnagiri', 'रत्नागिरी'),
    talukas: [
      place('mandangad', 'Mandangad', 'मंडणगड'),
      place('dapoli', 'Dapoli', 'दापोली'),
      place('khed', 'Khed', 'खेड'),
      place('chiplun', 'Chiplun', 'चिपळूण'),
      place('guhagar', 'Guhagar', 'गुहागर'),
      place('sangameshwar', 'Sangameshwar', 'संगमेश्वर'),
      place('ratnagiri', 'Ratnagiri', 'रत्नागिरी'),
      place('lanja', 'Lanja', 'लांजा'),
      place('rajapur', 'Rajapur', 'राजापूर'),
    ],
  },
  {
    ...place('raigad', 'Raigad', 'रायगड'),
    talukas: [
      place('alibag', 'Alibag', 'अलिबाग'),
      place('pen', 'Pen', 'पेण'),
      place('panvel', 'Panvel', 'पनवेल'),
      place('uran', 'Uran', 'उरण'),
      place('karjat', 'Karjat', 'कर्जत'),
      place('khalapur', 'Khalapur', 'खालापूर'),
      place('murud', 'Murud', 'मुरुड'),
      place('roha', 'Roha', 'रोहा'),
      place('sudhagad', 'Sudhagad', 'सुधागड'),
      place('mangaon', 'Mangaon', 'माणगाव'),
      place('tala', 'Tala', 'तळा'),
      place('shrivardhan', 'Shrivardhan', 'श्रीवर्धन'),
      place('mhasla', 'Mhasla', 'म्हसळा'),
      place('mahad', 'Mahad', 'महाड'),
      place('poladpur', 'Poladpur', 'पोलादपूर'),
    ],
  },
];

export function getDistrict(slug: string): DistrictOption | undefined {
  return districts.find((d) => d.slug === slug);
}
