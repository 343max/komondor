import { NativeModules, Platform } from 'react-native';
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

export const Komondor: Spec = KomondorModule
  ? KomondorModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );
