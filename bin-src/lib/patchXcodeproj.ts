import { command, option, optional, string } from 'cmd-ts';
import { glob } from './glob-promise';
import path from 'path';
import xcode from 'xcode';
import { writeFile } from './file';
import { ConfigEnvKey, readConfig } from './package-json';

export const patchXcodeproj = command({
  name: 'patch-xcodeproj',
  description: 'Add Komondor Build Phases to you Xcode Project',
  args: {
    providedXcodeproj: option({
      type: optional(string),
      long: 'xcodeproj',
      short: 'p',
      description: 'path to the xcodeproj to patch. Default: ios/*.xcodeproj',
    }),
  },
  handler: async ({ providedXcodeproj }) => {
    const xcodeProj = providedXcodeproj ?? (await glob('ios/*.xcodeproj'))[0];
    if (xcodeProj === undefined) {
      throw new Error('no xcodeproj found');
    }

    const { releaseConfiguration } = await readConfig();

    const pbxprojPath = path.join(xcodeProj, 'project.pbxproj');
    console.log(`patching ${xcodeProj}`);
    const project = xcode.project(pbxprojPath);
    project.parseSync();
    const target = project.getTarget('com.apple.product-type.application');
    if (target === null) {
      throw new Error("Couldn't find app target");
    }
    console.log(`Found target ${target.target.name}`);

    const buildConfigurationUUID = target.target.buildConfigurationList;

    const { value: configurationUUID } = project
      .pbxXCConfigurationList()
      [buildConfigurationUUID]!.buildConfigurations.find(
        ({ comment }) => comment === releaseConfiguration
      ) ?? { value: undefined };

    if (configurationUUID === undefined) {
      throw new Error(
        `Couldn't find buildConfiguration ${releaseConfiguration}`
      );
    }

    const configuration =
      project.pbxXCBuildConfigurationSection()[configurationUUID]!;

    const bundleId =
      configuration.buildSettings.PRODUCT_BUNDLE_IDENTIFIER!.replace(
        /^\"(.*)\"$/,
        (_, m) => m
      );

    if (bundleId.match(/^\$\(PRODUCT_BUNDLE_IDENTIFIER\:/)) {
      console.log(
        'PRODUCT_BUNDLE_IDENTIFIER seems to already have patched, skipping'
      );
    } else {
      configuration.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"$(PRODUCT_BUNDLE_IDENTIFIER:default=${bundleId})"`;
    }

    const addBuildPhaseIfNeeded = (
      buildPhaseName: string,
      scriptCb: () => string
    ) => {
      if (
        target.target.buildPhases.find(
          ({ comment }) => comment === buildPhaseName
        )
      ) {
        console.log(`Build phase ${buildPhaseName} already exists, skipping`);
      } else {
        console.log(`adding build phase ${buildPhaseName}`);
        project.addBuildPhase(
          [],
          'PBXShellScriptBuildPhase',
          buildPhaseName,
          target.uuid,
          {
            inputPaths: [],
            outputPaths: [],
            shellPath: '/bin/sh',
            shellScript: scriptCb(),
          }
        );
      }
    };

    addBuildPhaseIfNeeded('[Komondor] Patch Info.plist', () =>
      [
        "# DON'T EDIT! WILL BE AUTOMATICALLY REPLACED!",
        '',
        'if [[ -z "${KOMONDOR_ENABLED}" ]]; then',
        '  echo "komondor not enabled, skipping"',
        'else',
        '  WITH_ENVIRONMENT="../node_modules/react-native/scripts/xcode/with-environment.sh"',
        '  KOMONDOR_CLI="../node_modules/komondor/dist/bin/komondor-cli.js patch-info-plist"',
        '  source $WITH_ENVIRONMENT',
        '  $NODE_BINARY $KOMONDOR_CLI "$BUILT_PRODUCTS_DIR/$INFOPLIST_PATH"',
        'fi',
      ].join('\n')
    );

    addBuildPhaseIfNeeded('[Komondor] Add Komondor UI bundle', () =>
      [
        "# DON'T EDIT! WILL BE AUTOMATICALLY REPLACED!",
        '',
        'if [[ -z "${KOMONDOR_ENABLED}" ]]; then',
        '  echo "komondor not enabled, skipping"',
        'else',
        '  echo "Adding komondor.jsbundle package"',
        `  sed "s/bf4eb35237c40d159eaad6d2965df9a3b0934879/\$${ConfigEnvKey.appModuleName}/" ../node_modules/komondor/dist/ui/main.jsbundle > "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/komondor.jsbundle"`,
        'fi',
      ].join('\n')
    );

    console.log(`writing ${pbxprojPath}`);
    const buffer = project.writeSync();
    await writeFile(pbxprojPath, buffer);
  },
});
