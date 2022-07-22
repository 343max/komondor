import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import type { Spec } from './NativeBetterDevExp';

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

const EventEmitter = new NativeEventEmitter(NativeModules.BetterDevExp);

const BetterDevExp: Spec = BetterDevExpModule
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

const splitPort = (hostPort: string): { host: string; port: number } => {
  const [host, port] = hostPort.split(':');
  return { host: host ?? 'localhost', port: parseInt(port ?? '8081') ?? 8081 };
};

export const switchToPackager = async (
  bundleHost: string,
  scheme = 'http'
): Promise<void> => {
  const { host, port } = splitPort(bundleHost);
  BetterDevExp.switchToPackager(host, port, scheme);
};

export const getUrlSchemes = async (): Promise<string[]> =>
  BetterDevExp.getUrlSchemes();

export const isPackagerRunning = async (
  bundleHost: string,
  scheme = 'http'
): Promise<boolean> => {
  const { host, port } = splitPort(bundleHost);
  return await BetterDevExp.isPackagerRunning(host, port, scheme);
};

export const hasNotSwitched = async () => await BetterDevExp.hasNotSwitched();

export const isRunningOnDesktop = async () =>
  await BetterDevExp.isRunningOnDesktop();

export const getOpenURLQueue = async () => await BetterDevExp.getOpenURLQueue();

export const flushOpenURLQueue = async () =>
  await BetterDevExp.flushOpenURLQueue();

export function addEventListener(
  type: 'queueAdded',
  handler: (event: { url: string }) => void
): EmitterSubscription {
  return EventEmitter.addListener(type, handler);
}
