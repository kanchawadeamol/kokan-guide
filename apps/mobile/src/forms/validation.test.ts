import {
  consent,
  maxLength,
  normalizeIndianMobile,
  optionalPhone,
  optionalPincode,
  otp,
  personName,
  phone,
  rating,
  required,
  timeRange,
  validate,
} from './validation';

describe('normalizeIndianMobile', () => {
  it.each([
    ['9876543210', '+919876543210'],
    ['98765 43210', '+919876543210'],
    ['+91 98765-43210', '+919876543210'],
    ['09876543210', '+919876543210'],
    ['919876543210', '+919876543210'],
  ])('%j -> %s', (input, expected) => {
    expect(normalizeIndianMobile(input)).toBe(expected);
  });

  it.each(['5876543210', '987654321', '98765432100', '+44 7911 123456', 'abc', '+91 00000 00001'])(
    'rejects %j',
    (input) => {
      expect(normalizeIndianMobile(input)).toBeNull();
    },
  );
});

describe('validators', () => {
  it('required / phone / optionalPhone', () => {
    expect(required('  ')).toBe('errorRequired');
    expect(required('x')).toBeNull();
    expect(phone('')).toBe('errorRequired');
    expect(phone('12345')).toBe('errorPhone');
    expect(phone('9876543210')).toBeNull();
    expect(optionalPhone('')).toBeNull();
    expect(optionalPhone('123')).toBe('errorPhone');
  });

  it('otp needs exactly 6 digits', () => {
    expect(otp('123456')).toBeNull();
    expect(otp('12345')).toBe('errorOtp');
    expect(otp('12a456')).toBe('errorOtp');
  });

  it.each([
    ['Asha Patil', null],
    ['आशा पाटील', null],
    ["D'Souza-Naik", null],
    ['A', 'errorName'],
    ['Asha123', 'errorName'],
    ['', 'errorRequired'],
  ])('personName(%j) -> %s', (value, expected) => {
    expect(personName(value)).toBe(expected);
  });

  it('maxLength, pincode, rating, consent', () => {
    expect(maxLength(5)('123456')).toBe('errorTooLong');
    expect(maxLength(5)('12345')).toBeNull();
    expect(optionalPincode('')).toBeNull();
    expect(optionalPincode('415712')).toBeNull();
    expect(optionalPincode('015712')).toBe('errorPincode');
    expect(rating(0)).toBe('errorRating');
    expect(rating(5)).toBeNull();
    expect(rating(4.5)).toBe('errorRating');
    expect(consent(false)).toBe('errorConsent');
  });

  it.each([
    ['09:00', '18:00', null],
    ['18:00', '09:00', 'errorTimeRange'],
    ['09:00', '09:00', 'errorTimeRange'],
    ['9:00', '18:00', 'errorTimeRange'],
    ['24:00', '25:00', 'errorTimeRange'],
  ])('timeRange(%s, %s) -> %s', (open, close, expected) => {
    expect(timeRange(open, close)).toBe(expected);
  });

  it('validate collects only failing fields', () => {
    expect(
      validate<{ name: string; phone: string }>({
        name: () => personName('Asha'),
        phone: () => phone('123'),
      }),
    ).toEqual({ phone: 'errorPhone' });
  });
});
