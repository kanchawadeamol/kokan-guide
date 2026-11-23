import {
  maxLength,
  optionalPhone,
  optionalPincode,
  phone,
  required,
  timeRange,
} from './validation';
import type { ValidationError } from './validation';

export const BUSINESS_STEPS = ['details', 'address', 'contacts', 'hours', 'photos'] as const;
export type BusinessStep = (typeof BUSINESS_STEPS)[number];

export const DAYS = [1, 2, 3, 4, 5, 6, 0] as const; // Monday first
export type Day = (typeof DAYS)[number];

export interface DayHours {
  closed: boolean;
  open: string;
  close: string;
}

export interface BusinessForm {
  name: string;
  category: string;
  description: string;
  district: string;
  taluka: string;
  village: string;
  street: string;
  pincode: string;
  phone: string;
  whatsapp: string;
  whatsappSameAsPhone: boolean;
  hours: Record<Day, DayHours>;
  photos: string[];
  location: { latitude: number; longitude: number } | null;
}

export const MAX_PHOTOS = 5;

export function emptyBusinessForm(): BusinessForm {
  const hours = Object.fromEntries(
    DAYS.map((day) => [day, { closed: day === 0, open: '09:00', close: '18:00' }]),
  ) as Record<Day, DayHours>;
  return {
    name: '',
    category: '',
    description: '',
    district: '',
    taluka: '',
    village: '',
    street: '',
    pincode: '',
    phone: '',
    whatsapp: '',
    whatsappSameAsPhone: true,
    hours,
    photos: [],
    location: null,
  };
}

export type BusinessErrors = Partial<Record<string, ValidationError>>;

function collect(entries: [string, ValidationError | null][]): BusinessErrors {
  return Object.fromEntries(entries.filter(([, e]) => e !== null)) as BusinessErrors;
}

/** Validate one step; returns field -> error key (empty object when the step is valid). */
export function validateStep(step: BusinessStep, form: BusinessForm): BusinessErrors {
  switch (step) {
    case 'details':
      return collect([
        ['name', required(form.name) ?? maxLength(120)(form.name)],
        ['category', required(form.category)],
        ['description', maxLength(500)(form.description)],
      ]);
    case 'address':
      return collect([
        ['district', required(form.district)],
        ['taluka', required(form.taluka)],
        ['village', required(form.village) ?? maxLength(100)(form.village)],
        ['street', maxLength(200)(form.street)],
        ['pincode', optionalPincode(form.pincode)],
      ]);
    case 'contacts':
      return collect([
        ['phone', phone(form.phone)],
        ['whatsapp', form.whatsappSameAsPhone ? null : optionalPhone(form.whatsapp)],
      ]);
    case 'hours':
      return collect(
        DAYS.map((day) => {
          const h = form.hours[day];
          return [`hours-${day}`, h.closed ? null : timeRange(h.open, h.close)];
        }),
      );
    case 'photos':
      return {};
  }
}

export function copyMondayToAll(hours: Record<Day, DayHours>): Record<Day, DayHours> {
  const monday = hours[1];
  return Object.fromEntries(DAYS.map((day) => [day, { ...monday }])) as Record<Day, DayHours>;
}
