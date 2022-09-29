import { getComputerName } from './getComputerName';

describe('getComputerName', () => {
  test('no crash', () => {
    const res = getComputerName();
    expect(typeof res).toBe('string');
  });
});
