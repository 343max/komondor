import { addEventListener, BonjourService, scan, stopScanning } from 'komondor';
import React from 'react';
import type { EmitterSubscription } from 'react-native';

export const useBonjourScan = () => {
  const [services, setServices] = React.useState<BonjourService[]>([]);

  React.useEffect(() => {
    const listeners: EmitterSubscription[] = [];

    const f = async () => {
      listeners.push(
        await addEventListener('bonjourBrowserDidResolveAddress', (service) => {
          if (service.txt.service === 'komondor') {
            setServices([
              service,
              ...services.filter((s) => s.name === service.name),
            ]);
          }
        })
      );

      listeners.push(
        await addEventListener('bonjourBrowserDidRemoveService', (service) => {
          setServices(services.filter((s) => s.name === service.name));
        })
      );

      await scan('http', 'tcp', '');
    };
    f();

    return () => {
      listeners.forEach((l) => l.remove());
      stopScanning();
    };
  }, []);

  return services;
};
