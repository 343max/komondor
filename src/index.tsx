import { Komondor } from './Komondor';

export * from './eventListeners';
export * from './packager';

export const getUrlSchemes = async (): Promise<string[]> =>
  Komondor.getUrlSchemes();

export const hasNotSwitched = async () => await Komondor.hasNotSwitched();

export const isRunningOnDesktop = async () =>
  await Komondor.isRunningOnDesktop();

export const supportsLocalDevelopment = async () =>
  await Komondor.supportsLocalDevelopment();

export const getOpenURLQueue = async () => await Komondor.getOpenURLQueue();

export const storeDefaults = async (
  key: string,
  value: string
): Promise<void> => await Komondor.storeDefaults(key, value);

export const loadDefaults = async (key: string): Promise<undefined | string> =>
  await Komondor.loadDefaults(key);

export const myIPAddresses = async (): Promise<string[]> =>
  await Komondor.myIPAddresses();
