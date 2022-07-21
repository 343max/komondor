import { parseAppUrl } from './parseAppUrl';

describe('parseAppUrl', () => {
  test('invalid url', () => {
    const res = parseAppUrl(
      'com.example.betterdevexp-better-dev-exp://xxx/switch?host=localhost:8088'
    );
    expect(res).toBeUndefined();
  });

  test('invalid action', () => {
    const res = parseAppUrl(
      'com.example.betterdevexp-better-dev-exp://bde/swutch?host=localhost:8088'
    );
    expect(res).toBeUndefined();
  });

  test('switch host url', () => {
    const res = parseAppUrl(
      'com.example.betterdevexp-better-dev-exp://bde/switch?host=localhost:8088'
    );
    expect(res).toEqual({ action: 'switch-to-host', host: 'localhost:8088' });
  });

  test('switch to bundle', () => {
    const res = parseAppUrl(
      'com.example.betterdevexp-better-dev-exp://bde/switch?bundle=https%3A//github.com/343max/better-dev-exp/actions/new'
    );
    expect(res).toEqual({
      action: 'switch-to-bundle',
      bundleUrl: 'https://github.com/343max/better-dev-exp/actions/new',
    });
  });
});
