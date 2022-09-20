import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import type { Spec } from './NativeKomondor';

const LINKING_ERROR =
  `The package 'komondor' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const KomondorModule = isTurboModuleEnabled
  ? require('./NativeKomondor').default
  : NativeModules.Komondor;

const EventEmitter = new NativeEventEmitter(NativeModules.Komondor);

const Komondor: Spec = KomondorModule
  ? KomondorModule
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
  return {
    host: host ?? 'localhost',
    port: parseInt(port ?? '8081', 10) ?? 8081,
  };
};

export const switchToPackager = async (
  bundleHost: string,
  scheme = 'http'
): Promise<void> => {
  const { host, port } = splitPort(bundleHost);
  Komondor.switchToPackager(host, port, scheme);
};

export const getUrlSchemes = async (): Promise<string[]> =>
  Komondor.getUrlSchemes();

export const isPackagerRunning = async (
  bundleHost: string,
  scheme = 'http'
): Promise<boolean> => {
  const { host, port } = splitPort(bundleHost);
  return await Komondor.isPackagerRunning(host, port, scheme);
};

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

type Event =
  | 'queueAdded'
  | 'bonjourBrowserWillSearch'
  | 'bonjourBrowserDidStopSearch'
  | 'bonjourBrowserDidNotSearch'
  | 'bonjourBrowserDidFindService'
  | 'bonjourBrowserDidRemoveService'
  | 'bonjourBrowserDidResolveAddress'
  | 'bonjourBrowserDidNotResolve';

type AnEvent<T extends Event> = T;

type EventHandler<A> = (body: A) => void;

export function addEventListener(
  type: AnEvent<'queueAdded'>,
  handler: EventHandler<{ url: string }>
): EmitterSubscription;
export function addEventListener(
  type: AnEvent<'bonjourBrowserWillSearch'>,
  handler: EventHandler<void>
): EmitterSubscription;
export function addEventListener(
  type: AnEvent<'bonjourBrowserDidStopSearch'>,
  handler: EventHandler<void>
): EmitterSubscription;
export function addEventListener(
  type: AnEvent<'bonjourBrowserDidNotSearch'>,
  handler: EventHandler<NetServiceError>
): EmitterSubscription;
export function addEventListener(
  type: AnEvent<'bonjourBrowserDidFindService'>,
  handler: EventHandler<UnresolvedBonjourService>
): EmitterSubscription;
export function addEventListener(
  type: AnEvent<'bonjourBrowserDidRemoveService'>,
  handler: EventHandler<UnresolvedBonjourService>
): EmitterSubscription;
export function addEventListener(
  type: AnEvent<'bonjourBrowserDidResolveAddress'>,
  handler: EventHandler<BonjourService>
): EmitterSubscription;
export function addEventListener(
  type: AnEvent<'bonjourBrowserDidNotResolve'>,
  handler: EventHandler<BonjourService>
): EmitterSubscription;

export function addEventListener(
  type: Event,
  handler: EventHandler<any>
): EmitterSubscription {
  return EventEmitter.addListener(type, handler);
}

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

export const stopScanning = async (): Promise<void> => Komondor.stopScanning();
