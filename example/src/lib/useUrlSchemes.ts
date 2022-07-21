import { getUrlSchemes } from 'better-dev-exp';
import React from 'react';

export const useUrlSchemes = (): string[] => {
  const [urlSchemes, setUrlSchemes] = React.useState<string[]>([]);
  React.useEffect(() => {
    getUrlSchemes().then(setUrlSchemes);
  }, []);

  return urlSchemes;
};
