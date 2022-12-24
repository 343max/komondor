import { Komondor } from './Komondor';

export type NetServiceError = {
  NSNetServicesErrorCode: string;
  NSNetServicesErrorDomain: number;
};

export type UnresolvedBonjourService = {
  name: string;
};

export type BonjourService = UnresolvedBonjourService & {
  fullName: string;
  addresses: string[];
  host: string;
  port: number;
  txt: Record<string, string>;
};

export const scan = async (
  type: string,
  protocol: string,
  domain: string
): Promise<void> => Komondor.scan(type, protocol, domain);

export const stopScanning = async (): Promise<void> =>
  await Komondor.stopScanning();
