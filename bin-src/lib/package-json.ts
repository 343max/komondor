import { readFile } from './file';
import { guessPackageJsonPath } from './guessPackageJsonPath';

export const readPackageJson = async (packageJsonPath?: string) => {
  const path = packageJsonPath ?? guessPackageJsonPath();

  if (path == undefined) {
    throw new Error(
      "couldn't guess package.json path. Please make sure to run this script through npm/yarn/npx or provide it using arugments"
    );
  }

  try {
    return JSON.parse(await readFile(path));
  } catch (error) {
    throw new Error(`couldn't read package.json: ${error}`);
  }
};

export type Config = {
  displayName: string;
  bundleIdentifier?: string;
  protocolHandler: string;
  releaseConfiguration: string;
  debugConfiguration: string;
  startCmd: string;
  metroPort?: number | string;
  moduleName?: string;
};

export const ConfigEnvKey = {
  komondorEnabled: 'KOMONDOR_ENABLED',
  displayName: 'KO_PRODUCT_NAME',
  bundleIdentifier: 'KO_PRODUCT_BUNDLE_IDENTIFIER',
  protocolHandler: 'KO_PROTOCOL_HANDLER',
  appModuleName: 'KO_APP_MODULE_NAME',
};

export const readConfig = async (
  packageJsonPath?: string
): Promise<Config> => ({
  displayName: '$(PRODUCT_NAME) Dev',
  protocolHandler: '$(KO_PRODUCT_BUNDLE_IDENTIFIER)',
  releaseConfiguration: 'Release',
  debugConfiguration: 'Debug',
  startCmd: 'npx react-native start',
  ...(await readPackageJson(packageJsonPath)).komondor,
});
