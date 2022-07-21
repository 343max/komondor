import React from 'react';
import { useOpenUrlListener } from './useOpenUrlListener';
import { useOpenURLQueue } from './useOpenURLQueue';

export const useHandleUrl = (handler: (url: string) => void) => {
  const openUrl = useOpenUrlListener();
  const queuedUrls = useOpenURLQueue();

  React.useEffect(() => {
    if (openUrl !== undefined) {
      handler(openUrl);
    }
  }, [openUrl]);

  React.useEffect(() => {
    if (queuedUrls.length > 0) {
      handler(queuedUrls[0]!);
    }
  }, [queuedUrls]);
};
