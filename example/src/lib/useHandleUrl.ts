import { addEventListener, getOpenURLQueue } from 'komondor';
import React from 'react';
import { useAsyncEffect } from './useAsyncEffect';

export const useHandleUrl = (handler: (url: string) => void) => {
  useAsyncEffect(async () => {
    (await getOpenURLQueue()).forEach((url) => handler(url));
  }, []);

  React.useEffect(() => {
    const subscription = addEventListener('queueAdded', ({ url }) =>
      handler(url)
    );

    return () => subscription.remove();
  }, []);
};
