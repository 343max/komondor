import { readFile } from './file';

export const readPackageJson = async () => {
  if (process.env.npm_package_json === undefined) {
    throw new Error(
      "couldn't read package.json path from env file. Please make sure to run this script through npm/yarn/npx"
    );
  }

  try {
    return JSON.parse(await readFile(process.env.npm_package_json));
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

export const readConfig = async (): Promise<Config> => ({
  displayName: '$(PRODUCT_NAME) Dev',
  protocolHandler: '$(KO_PRODUCT_BUNDLE_IDENTIFIER)',
  releaseConfiguration: 'Release',
  debugConfiguration: 'Debug',
  startCmd: 'npx react-native start',
  ...(await readPackageJson()).komondor,
});
