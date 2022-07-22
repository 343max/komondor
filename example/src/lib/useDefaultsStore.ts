import React from 'react';
import { loadDefaults, storeDefaults } from 'better-dev-exp';
import { useAsyncEffect } from './useAsyncEffect';

export const useDefaultsStore = <T, D>(
  key: string,
  initial: D
): [T | D, (value: T) => Promise<void>] => {
  const [value, setValue] = React.useState<T | D>(initial);
  useAsyncEffect(async () => {
    const jsonValue = await loadDefaults(key);
    if (jsonValue !== undefined) {
      setValue(JSON.parse(jsonValue));
    }
  }, []);

  const setter = async (value: T) => {
    setValue(value);
    const jsonValue = JSON.stringify(value);
    await storeDefaults(key, jsonValue);
  };

  return [value, setter];
};
