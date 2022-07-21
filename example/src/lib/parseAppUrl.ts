type Result =
  | {
      action: 'switch-to-host';
      host: string;
    }
  | {
      action: 'switch-to-bundle';
      bundleUrl: string;
    };

export const parseAppUrl = (urlString: string): Result | undefined => {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return undefined;
  }
  if (url.host !== 'bde') {
    return undefined;
  } else if (url.pathname === '/switch' && url.searchParams.has('host')) {
    return {
      action: 'switch-to-host',
      host: url.searchParams.get('host')!,
    };
  } else if (url.pathname === '/switch' && url.searchParams.has('bundle')) {
    return {
      action: 'switch-to-bundle',
      bundleUrl: url.searchParams.get('bundle')!,
    };
  } else {
    return undefined;
  }
};
