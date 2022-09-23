import { command, option, optional, string } from 'cmd-ts';
import { readFile, writeFile } from './file';
import { glob } from './glob-promise';
import { ConfigEnvKey, readConfig } from './package-json';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const guessModuleName = async () => {
  if (typeof process.env.npm_package_json !== 'string') {
    return undefined;
  }
  const appJsonPath = join(dirname(process.env.npm_package_json), 'app.json');
  if (!existsSync(appJsonPath)) {
    return undefined;
  }
  const json = JSON.parse(await readFile(appJsonPath));
  const name = json.name;
  return typeof name === 'string' ? name : undefined;
};

export const patchPodsCommand = command({
  name: 'patch-xcconfig',
  description:
    'patches the cocoapods xcconfig files to enable Komondor for that build. Should be run on CI builds after pod install.',
  args: {
    customPodsDir: option({
      type: optional(string),
      long: 'pods',
      short: 'p',
      description: 'path to the Pods directory. Default: ios/Pods',
    }),
    customBundleIdentifier: option({
      type: optional(string),
      long: 'bundle-identifier',
      short: 'i',
      description:
        'komondor app bundle identifier. e.g. <your bundle identifier>.komondor',
    }),
    customModuleName: option({
      type: optional(string),
      long: 'module-name',
      short: 'm',
      description:
        'name of the module that is expected by the native app. (see app.json -> name)',
      env: 'KOMONDOR_APP_MODULE_NAME',
    }),
  },
  handler: async ({ customPodsDir, customModuleName }) => {
    const matchingLine = (
      file: string,
      matcher: { [Symbol.match](string: string): RegExpMatchArray | null }
    ) => file.split('\n').find((l) => l.match(matcher));

    const {
      releaseConfiguration,
      debugConfiguration,
      displayName,
      bundleIdentifier,
      protocolHandler,
      moduleName: configModuleName,
    } = await readConfig();

    const moduleName =
      customModuleName ?? configModuleName ?? (await guessModuleName());

    if (typeof moduleName !== 'string') {
      throw new Error(
        "moduleName couldn't be guessed. config in package.json -> komondor.moduleName or --module-name or env KOMONDOR_APP_MODULE_NAME"
      );
    }

    const podsDir = customPodsDir ?? 'ios/Pods';

    const configs = await glob(
      `${podsDir}/Target Support Files/*/*.${releaseConfiguration.toLowerCase()}.xcconfig`
    );

    if (configs.length === 0) {
      throw new Error(
        `no Cocoapods xcconfigs found in ${podsDir}. Please make sure you called pod install and check the pods argument`
      );
    }

    const patchComment = `// patched in by komondor. Revert by running pod install again`;

    for (const releaseConfigPath of configs) {
      const releaseContent = await readFile(releaseConfigPath);
      const debugContent = await readFile(
        releaseConfigPath.replace(
          `${releaseConfiguration.toLowerCase()}.xcconfig`,
          `${debugConfiguration.toLowerCase()}.xcconfig`
        )
      );

      const debugPreprocessorDefinitions = matchingLine(
        debugContent,
        /^GCC_PREPROCESSOR_DEFINITIONS/
      );

      const releasePreprocessorDefinitions = matchingLine(
        releaseContent,
        /^GCC_PREPROCESSOR_DEFINITIONS/
      );

      const sonarKitEnabled = debugPreprocessorDefinitions?.includes(
        'FB_SONARKIT_ENABLED=1'
      );

      const preprocessoerDefinitions = [
        releasePreprocessorDefinitions,
        'DEBUG=1',
        ...(sonarKitEnabled ? ['FB_SONARKIT_ENABLED=1'] : []),
        'KOMONDOR_ENABLED=1',
      ].join(' ');

      if (releaseContent.includes(patchComment)) {
        console.log(`${releaseConfigPath} already patched, skipping`);
      } else {
        await writeFile(
          releaseConfigPath,
          [
            patchComment,
            '',
            releaseContent,
            '// patched:',
            `${ConfigEnvKey.komondorEnabled} = YES`,
            'SKIP_BUNDLING = YES',
            'RCT_NO_LAUNCH_PACKAGER = YES',
            'PRODUCT_BUNDLE_IDENTIFIER = ${ConfigEnvKey.bundleIdentifier}',
            `${ConfigEnvKey.displayName} = ${displayName}`,
            `${ConfigEnvKey.bundleIdentifier} = ${bundleIdentifier}`,
            `${ConfigEnvKey.protocolHandler} = ${protocolHandler}`,
            `${ConfigEnvKey.appModuleName} = ${moduleName}`,
            preprocessoerDefinitions,
          ].join('\n')
        );
        console.log(`patched ${releaseConfigPath}`);
      }
    }
  },
});
