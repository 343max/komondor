import React from 'react';
import { useAsyncEffect } from './useAsyncEffect';

export function useAsyncMemo<T, D>(
  memoFn: () => Promise<T>,
  deps: React.DependencyList,
  initial: D
): T | D {
  const [result, setResult] = React.useState<T | D>(initial);

  useAsyncEffect(async () => {
    setResult(initial);
    setResult(await memoFn());
  }, deps);

  return result;
}
