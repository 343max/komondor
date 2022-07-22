import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getUrlSchemes(): Promise<string[]>;
  isPackagerRunning(
    host: string,
    port: number,
    scheme: string
  ): Promise<boolean>;
  switchToPackager(host: string, port: number, scheme: string): Promise<void>;
  hasNotSwitched(): Promise<boolean>;
  isRunningOnDesktop(): Promise<boolean>;
  supportsLocalDevelopment(): Promise<boolean>;
  getOpenURLQueue(): Promise<string[]>;
  storeDefaults(key: string, value: string): Promise<void>;
  loadDefaults(key: string): Promise<undefined | string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BetterDevExp');
