import { hasNotSwitched } from 'better-dev-exp';
import React from 'react';

export const useIsInitialRun = (): boolean => {
  const [isInitialRun, setIsInitialRun] = React.useState(false);

  React.useEffect(() => {
    hasNotSwitched().then((notSwitched) => setIsInitialRun(notSwitched));
  });

  return isInitialRun;
};
