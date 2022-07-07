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
}

export default TurboModuleRegistry.getEnforcing<Spec>('BetterDevExp');
