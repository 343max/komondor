import React from 'react';
import { Linking } from 'react-native';

export const useOpenUrlListener = () => {
  const [url, setUrl] = React.useState<string>();

  React.useEffect(() => {
    const listener = Linking.addEventListener('url', ({ url }) => setUrl(url));

    return () => listener.remove();
  }, []);

  return url;
};
