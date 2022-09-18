#!/usr/bin/env node

import { run, command, subcommands, positional, string } from 'cmd-ts';
import { promisify } from 'util';
import plist from 'simple-plist';
import { promise as glob } from 'glob-promise';
import { ConfigEnvKey, readConfig } from '../lib/package-json';
import { readFile, writeFile } from '../lib/file';
import { patchXcodeproj } from '../lib/patchPodsCommand';

const readPlistFile = promisify(plist.readFile);
const writePlistFile = promisify(plist.writeBinaryFile);

const patchInfoPlistCommand = command({
  name: 'patch-info-plist',
  args: {
    plistPath: positional({ type: string, displayName: 'plist path' }),
  },
  handler: async ({ plistPath }) => {
    const dict = (await readPlistFile<any>(plistPath))!;

    dict.CFBundleURLTypes = [
      ...(dict.CFBundleURLTypes ?? []),
      {
        CFBundleURLName: process.env[ConfigEnvKey.bundleIdentifier],
        CFBundleURLSchemes: [process.env[ConfigEnvKey.protocolHandler]],
      },
    ];

    dict.CFBundleDisplayName = process.env[ConfigEnvKey.displayName];
    dict.CFBundleIdentifier = process.env[ConfigEnvKey.bundleIdentifier];

    dict.NSAppTransportSecurity = { NSAllowsArbitraryLoads: true };

    await writePlistFile(plistPath, dict);
    console.log(`komondor patched ${plistPath}`);
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

    const {
      releaseConfiguration,
      debugConfiguration,
      displayName,
      bundleIdentifier,
      protocolHandler,
    } = await readConfig();

    const configs = await glob(
      `ios/Pods/Target Support Files/*/*.${releaseConfiguration.toLowerCase()}.xcconfig`
    );

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

const commands = subcommands({
  name: 'komondor',
  cmds: {
    'patch-info-plist': patchInfoPlistCommand,
    'patch-pods': patchPodsCommand,
    'patch-xcodeproj': patchXcodeproj,
  },
});

run(commands, process.argv.slice(2));
