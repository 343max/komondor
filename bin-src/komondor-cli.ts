#!/usr/bin/env node

import { run, command, subcommands, positional, string } from 'cmd-ts';
import { open } from 'fs/promises';
import plist from 'plist';
import { promise as glob } from 'glob-promise';

const readFile = async (path: string) => {
  const f = await open(path);
  const content = await f.readFile({ encoding: 'utf-8' });
  f.close();
  return content;
};

const readPackageJson = async () => {
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

type Config = {
  displayName: string;
  bundleIdentifier: string;
  protocolHandler: string;
  releaseConfiguration: string;
  debugConfiguration: string;
};

const readBdeConfig = async (): Promise<Config> => ({
  displayName: '$(PRODUCT_NAME) Dev',
  bundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER).bde',
  protocolHandler: '$(PRODUCT_BUNDLE_IDENTIFIER).bde',
  releaseConfiguration: 'Release',
  debugConfiguration: 'Debug',
  ...(await readPackageJson()).betterDevExp,
});

const patchInfoPlistCommand = command({
  name: 'patch-info-plist',
  args: {
    plistPath: positional({ type: string, displayName: 'plist path' }),
  },
  handler: async ({ plistPath }) => {
    const xml = await readFile(plistPath);

    const dict = plist.parse(xml) as Record<string, any>;

    const { protocolHandler } = await readBdeConfig();

    dict.CFBundleURLTypes = [
      ...(dict.CFBundleURLTypes ?? []),
      {
        CFBundleURLName: '$(PRODUCT_BUNDLE_IDENTIFIER)',
        CFBundleURLSchemes: [protocolHandler],
      },
    ];

    dict.NSAppTransportSecurity = { NSAllowsArbitraryLoads: true };

    const f = await open(plistPath, 'w');
    f.writeFile(plist.build(dict));
    f.close();
  },
});

const patchPodsCommand = command({
  name: 'patch-pods',
  args: {},
  handler: async () => {
    const matchingLine = (
      file: string,
      matcher: { [Symbol.match](string: string): RegExpMatchArray | null }
    ) => file.split('\n').find((l) => l.match(matcher));

    const { releaseConfiguration, debugConfiguration } = await readBdeConfig();

    const configs = await glob(
      `ios/Pods/Target Support Files/*/*.${releaseConfiguration.toLowerCase()}.xcconfig`
    );

    const patchComment = `// patched in by ${command}. Revert by running pod install again`;

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
      ].join(' ');

      if (releaseContent.includes(patchComment)) {
        console.log(`${releaseConfigPath} already patched, skipping`);
      } else {
        const fw = await open(releaseConfigPath, 'w');
        fw.writeFile(
          [
            patchComment,
            '',
            releaseContent,
            '// patched:',
            'SKIP_BUNDLING = YES',
            'RCT_NO_LAUNCH_PACKAGER = YES',
            preprocessoerDefinitions,
            // 'PRODUCT_NAME=xxxx',
            // 'PRODUCT_BUNDLE_IDENTIFIER=yyyy',
          ].join('\n')
        );
        await fw.close();
        console.log(`patched ${releaseConfigPath}`);
      }
    }
  },
});

const commands = subcommands({
  name: 'komondor',
  cmds: {
    'patch-info-plist': patchInfoPlistCommand,
    'patch-pods': patchPodsCommand,
  },
});

run(commands, process.argv.slice(2));
