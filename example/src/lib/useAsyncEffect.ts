import React from 'react';

export const useAsyncEffect = (
  effect: () => Promise<void>,
  deps?: React.DependencyList | undefined
) => {
  React.useEffect(() => {
    effect();
  }, deps);
};
