#!/usr/bin/env node

import {
  run,
  command,
  subcommands,
  positional,
  string,
  option,
  optional,
} from 'cmd-ts';
import path from 'path';
import { open } from 'fs/promises';
import { promisify } from 'util';
import plist from 'simple-plist';
import { promise as glob } from 'glob-promise';
import xcode from 'xcode';

const readFile = async (path: string) => {
  const f = await open(path);
  const content = await f.readFile({ encoding: 'utf-8' });
  f.close();
  return content;
};

const writeFile = async (path: string, content: string) => {
  const fw = await open(path, 'w');
  fw.writeFile(content);
  await fw.close();
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

const ConfigEnvKey = {
  displayName: 'KO_PRODUCT_NAME',
  bundleIdentifier: 'KO_PRODUCT_BUNDLE_IDENTIFIER',
  protocolHandler: 'KO_PROTOCOL_HANDLER',
};

const readBdeConfig = async (): Promise<Config> => ({
  displayName: '$(PRODUCT_NAME) Dev',
  bundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER).komondor',
  protocolHandler: '$(PRODUCT_BUNDLE_IDENTIFIER).komondor',
  releaseConfiguration: 'Release',
  debugConfiguration: 'Debug',
  ...(await readPackageJson()).betterDevExp,
});

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
    } = await readBdeConfig();

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

const patchXcodeproj = command({
  name: 'patch-xcodeproj',
  description: 'Add Komondor Build Phases to you Xcode Project',
  args: {
    providedXcodeproj: option({
      type: optional(string),
      long: 'xcproj',
      short: 'p',
    }),
  },
  handler: async ({ providedXcodeproj }) => {
    const xcodeProj = providedXcodeproj ?? (await glob('ios/*.xcodeproj'))[0];
    if (xcodeProj === undefined) {
      throw new Error('no xcproj found');
    }
    const pbxprojPath = path.join(xcodeProj, 'project.pbxproj');
    console.log(`patching ${xcodeProj}`);
    const project = xcode.project(pbxprojPath);
    project.parseSync();
    const target = project.getTarget('com.apple.product-type.application');
    if (target === null) {
      throw new Error("Couldn't find app target");
    }
    console.log(`Found target ${target.target.name}`);
    const plistPatchBuildPhaseName = '[Komondor] patch Info.plist';
    if (
      target.target.buildPhases.find(
        ({ comment }) => comment === plistPatchBuildPhaseName
      )
    ) {
      console.log(
        `Build phase ${plistPatchBuildPhaseName} already exists, skipping`
      );
    } else {
      console.log(`adding build phase ${plistPatchBuildPhaseName}`);
      project.addBuildPhase(
        [],
        'PBXShellScriptBuildPhase',
        plistPatchBuildPhaseName,
        target.uuid,
        {
          inputPaths: [],
          outputPaths: [],
          shellPath: '/bin/sh',
          shellScript: [
            'if [[ -z "${KOMONDOR_ENABLED}" ]]; then',
            '  echo "komondor not enabled, skipping"',
            'else',
            '  WITH_ENVIRONMENT="../node_modules/react-native/scripts/xcode/with-environment.sh"',
            '  KOMONDOR_CLI="../node_modules/better-dev-exp/dist/bin/komondor-cli.js patch-info-plist ${TARGET_BUILD_DIR}/${INFOPLIST_PATH}"',
            '  source $WITH_ENVIRONMENT',
            '  $NODE_BINARY $KOMONDOR_CLI',
            'fi',
          ].join('\n'),
        }
      );
    }

    console.log(`writing ${pbxprojPath}`);
    const buffer = project.writeSync();
    await writeFile(pbxprojPath, buffer);
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
