import { getCanonicalRepoName } from './getCanonicalRepoName';

describe('getShortRepoName', () => {
  test('github ssh url', () => {
    const res = getCanonicalRepoName('git@github.com:343max/komondor.git');
    expect(res).toEqual('github.com:343max/komondor');
  });

  test('github https url', () => {
    const res = getCanonicalRepoName('https://github.com/343max/komondor.git');
    expect(res).toEqual('github.com:343max/komondor');
  });

  test('custom https url', () => {
    const res = getCanonicalRepoName('https://example.com/343max/komondor.git');
    expect(res).toEqual('example.com:343max/komondor');
  });

  test('custom http url', () => {
    const res = getCanonicalRepoName('http://example.com/343max/komondor.git');
    expect(res).toEqual('example.com:343max/komondor');
  });

  test('custom ssh url', () => {
    const res = getCanonicalRepoName('user@example.com:343max/komondor.git');
    expect(res).toEqual('example.com:343max/komondor');
  });
});
