import React from 'react';

export const useAsyncEffect = (
  effect: () => Promise<void>,
  deps: React.DependencyList
) => {
  React.useEffect(() => {
    effect();
  }, deps);
};
