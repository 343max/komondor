import { command, option, optional, string } from 'cmd-ts';
import { readFile, writeFile } from './file';
import { glob } from './glob-promise';
import { ConfigEnvKey, readConfig } from './package-json';

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
  },
  handler: async ({ customPodsDir }) => {
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
    } = await readConfig();

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
            'KOMONDOR_ENABLED = YES',
            'SKIP_BUNDLING = YES',
            'RCT_NO_LAUNCH_PACKAGER = YES',
            `${ConfigEnvKey.displayName} = ${displayName}`,
            `${ConfigEnvKey.bundleIdentifier} = ${bundleIdentifier}`,
            `${ConfigEnvKey.protocolHandler} = ${protocolHandler}`,
            preprocessoerDefinitions,
          ].join('\n')
        );
        console.log(`patched ${releaseConfigPath}`);
      }
    }
  },
});
