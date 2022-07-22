import { isPackagerRunning } from 'better-dev-exp';
import React from 'react';
import { useInterval } from './useInterval';

export const useRunningPackagers = (packagers: string[]): string[] => {
  const [running, setRunning] = React.useState<string[]>([]);

  useInterval(async () => {
    const r = (
      await Promise.all(
        [...new Set(packagers)].map(async (host) => {
          const isRunning = await isPackagerRunning(host);
          return isRunning ? host : null;
        })
      )
    ).filter((v) => v !== null);
    setRunning(r as string[]);
  }, 300);

  return running;
};
