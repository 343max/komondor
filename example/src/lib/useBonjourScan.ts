import { addEventListener, BonjourService, scan, stopScanning } from 'komondor';
import React from 'react';

export const useBonjourScan = () => {
  const [services, setServices] = React.useState<BonjourService[]>([]);

  React.useEffect(() => {
    const f = async () => {
      const didResolveAddressListener = await addEventListener(
        'bonjourBrowserDidResolveAddress',
        (service) => {
          console.log({ didResolveAddress: service });
        }
      );

      const didRemoveServiceListener = await addEventListener(
        'bonjourBrowserDidRemoveService',
        (service) => {
          console.log({ didRemoverService: service });
        }
      );

      await scan('http', 'tcp', '');
    };
    f();

    return () => {
      stopScanning();
    };
  }, []);
};
