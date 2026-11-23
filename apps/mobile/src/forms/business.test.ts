import { copyMondayToAll, emptyBusinessForm, validateStep } from './business';
import type { BusinessForm } from './business';

function form(changes: Partial<BusinessForm>): BusinessForm {
  return { ...emptyBusinessForm(), ...changes };
}

describe('validateStep', () => {
  it('details: name and category required, description limited', () => {
    expect(validateStep('details', form({}))).toEqual({
      name: 'errorRequired',
      category: 'errorRequired',
    });
    expect(
      validateStep(
        'details',
        form({ name: 'Asha Clinic', category: 'clinics', description: 'x'.repeat(501) }),
      ),
    ).toEqual({ description: 'errorTooLong' });
    expect(validateStep('details', form({ name: 'Asha Clinic', category: 'clinics' }))).toEqual({});
  });

  it('address: district, taluka, village required; PIN code optional but valid', () => {
    expect(validateStep('address', form({}))).toEqual({
      district: 'errorRequired',
      taluka: 'errorRequired',
      village: 'errorRequired',
    });
    expect(
      validateStep(
        'address',
        form({ district: 'ratnagiri', taluka: 'dapoli', village: 'Dapoli', pincode: '12' }),
      ),
    ).toEqual({ pincode: 'errorPincode' });
  });

  it('contacts: valid phone required; WhatsApp checked only when different', () => {
    expect(validateStep('contacts', form({ phone: '123' }))).toEqual({ phone: 'errorPhone' });
    expect(validateStep('contacts', form({ phone: '9876543210', whatsapp: 'bad' }))).toEqual({});
    expect(
      validateStep(
        'contacts',
        form({ phone: '9876543210', whatsappSameAsPhone: false, whatsapp: 'bad' }),
      ),
    ).toEqual({ whatsapp: 'errorPhone' });
  });

  it('hours: open days need open < close; closed days are skipped', () => {
    const valid = emptyBusinessForm();
    expect(validateStep('hours', valid)).toEqual({});

    const broken = emptyBusinessForm();
    broken.hours[2] = { closed: false, open: '18:00', close: '09:00' };
    broken.hours[0] = { closed: true, open: 'xx', close: 'yy' };
    expect(validateStep('hours', broken)).toEqual({ 'hours-2': 'errorTimeRange' });
  });

  it('photos step is optional', () => {
    expect(validateStep('photos', form({}))).toEqual({});
  });
});

it('copyMondayToAll copies values without sharing objects', () => {
  const hours = emptyBusinessForm().hours;
  hours[1] = { closed: false, open: '07:30', close: '21:00' };
  const copied = copyMondayToAll(hours);

  expect(copied[0]).toEqual({ closed: false, open: '07:30', close: '21:00' });
  copied[3].open = '10:00';
  expect(copied[1].open).toBe('07:30');
});
