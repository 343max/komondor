import type { BonjourService } from 'komondor';
import { switchToPackager } from 'komondor';
import React from 'react';
import { getShortRepoName } from '../lib/getShortRepoName';
import { useBonjourScan } from '../lib/useBonjourScan';
import { List, ListItem } from './List';

export const PackagerList: React.FC = () => {
  const services = useBonjourScan();

  const packagerItems: (ListItem & { service: BonjourService })[] =
    React.useMemo(
      () =>
        services.map((service) => {
          return {
            title: service.name,
            subtitle: [
              getShortRepoName(service.txt.repo ?? ''),
              '>',
              service.txt.branch,
            ].join(' '),
            service,
          };
        }),
      [services]
    );
  return (
    <List
      header="Running Packagers"
      items={packagerItems}
      onPress={({ service }) => {
        switchToPackager(`${service.addresses[0]}:${service.port}`).catch(
          (exception) => console.log(exception)
        );
      }}
    />
  );
};
