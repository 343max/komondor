import { getShortRepoName } from './getShortRepoName';

describe('getShortRepoName', () => {
  test('github ssh domain', () => {
    const res = getShortRepoName('git@github.com:343max/komondor.git');
    expect(res).toEqual('gh 343max/komondor');
  });

  test('github https domain', () => {
    const res = getShortRepoName('https://github.com/343max/komondor.git');
    expect(res).toEqual('gh 343max/komondor');
  });

  test("unknown url shouldn't be touched", () => {
    const res = getShortRepoName('https://example.com/343max/komondor.git');
    expect(res).toEqual('https://example.com/343max/komondor.git');
  });
});
