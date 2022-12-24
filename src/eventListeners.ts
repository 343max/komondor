import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import type {
  BonjourService,
  NetServiceError,
  UnresolvedBonjourService,
} from './bonjourService';

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

const EventEmitter = new NativeEventEmitter(NativeModules.Komondor);

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
