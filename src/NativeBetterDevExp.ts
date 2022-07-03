import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getUrlSchemes(): Promise<string[]>;
  isPackagerRunning(host: string, scheme: string | null): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BetterDevExp');
