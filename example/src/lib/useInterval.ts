import React from 'react';

export const useInterval = (
  callback: (() => void) | (() => Promise<void>),
  delay: number,
  intervalCleared?: () => void
) => {
  const savedCallback = React.useRef(callback);
  const savedIntervalCleared = React.useRef(intervalCleared);

  React.useEffect(() => {
    savedCallback.current = callback;
  });

  React.useEffect(() => {
    savedIntervalCleared.current = intervalCleared;
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      if (savedIntervalCleared.current !== undefined) {
        savedIntervalCleared.current();
      }
      clearInterval(interval);
    };
  }, [delay]);
};
