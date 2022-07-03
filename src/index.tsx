import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'better-dev-exp' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const BetterDevExpModule = isTurboModuleEnabled
  ? require('./NativeBetterDevExp').default
  : NativeModules.BetterDevExp;

const BetterDevExp = BetterDevExpModule
  ? BetterDevExpModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export type Bundle = {
  url: string;
  name: string;
};

export const getAvailableLocalBundles = async (): Promise<Bundle[]> => [];

export const switchToBundle = async (bundleUrl: string): Promise<void> => {
  // dummy!
};

export const getUrlSchemes = async (): Promise<string[]> =>
  BetterDevExp.getUrlSchemes();

export const isPackagerRunning = async (
  host: string,
  scheme?: string
): Promise<boolean> => BetterDevExp.isPackagerRunning(host, scheme ?? null);
