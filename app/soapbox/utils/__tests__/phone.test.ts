import { formatPhoneNumber } from '../phone';

describe('Phone unit tests', () => {
  it('Properly formats', () => {
    let number = '';
    expect(formatPhoneNumber('1', number)).toEqual('');

    number = '5';
    expect(formatPhoneNumber('1', number)).toEqual('+1 (5');

    number = '55';
    expect(formatPhoneNumber('1', number)).toEqual('+1 (55');

    number = '555';
    expect(formatPhoneNumber('1', number)).toEqual('+1 (555');

    number = '55513';
    expect(formatPhoneNumber('1', number)).toEqual('+1 (555) 13');

    number = '555135';
    expect(formatPhoneNumber('1', number)).toEqual('+1 (555) 135');

    number = '5551350';
    expect(formatPhoneNumber('1', number)).toEqual('+1 (555) 135-0');

    number = '5551350123';
    expect(formatPhoneNumber('1', number)).toEqual('+1 (555) 135-0123');
  });
});
