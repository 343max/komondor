import { myIPAddresses } from 'komondor';
import React from 'react';
import { useAsyncEffect } from './useAsyncEffect';
import { useInterval } from './useInterval';

export const useMyIPAddresses = () => {
  const [addresses, setAddresses] = React.useState<string[]>([]);

  const updateMyIPAddresses = async () => setAddresses(await myIPAddresses());

  useAsyncEffect(updateMyIPAddresses, []);
  useInterval(updateMyIPAddresses, 3000);

  return addresses;
};
