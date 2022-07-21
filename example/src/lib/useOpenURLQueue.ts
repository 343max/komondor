import React from 'react';
import { flushOpenURLQueue, getOpenURLQueue } from 'better-dev-exp';
import { useAsyncEffect } from './useAsyncEffect';

export const useOpenURLQueue = () => {
  const [queue, setQueue] = React.useState<string[]>([]);
  useAsyncEffect(async () => {
    const q = await getOpenURLQueue();
    if (q.length > 0) {
      await flushOpenURLQueue();
    }
    setQueue(q);
  }, []);

  return queue;
};
