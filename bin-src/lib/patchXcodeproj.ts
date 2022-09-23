import { command, option, optional, string } from 'cmd-ts';
import { glob } from './glob-promise';
import path from 'path';
import xcode from 'xcode';
import { writeFile, readFile } from './file';
import { dirname, join } from 'path';
import { readConfig } from './package-json';

const guessModuleName = async () => {
  if (typeof process.env.npm_package_json !== 'string') {
    return undefined;
  }
  const appJsonPath = join(dirname(process.env.npm_package_json), 'app.json');
  const json = JSON.parse(await readFile(appJsonPath));
  const name = json.name;
  return typeof name === 'string' ? name : undefined;
};

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
    customModuleName: option({
      type: optional(string),
      long: 'module-name',
      short: 'm',
      description:
        'name of the module that is expected by the native app. (see app.json -> name)',
      env: 'KOMONDOR_APP_MODULE_NAME',
    }),
  },
  handler: async ({ providedXcodeproj, customModuleName }) => {
    const xcodeProj = providedXcodeproj ?? (await glob('ios/*.xcodeproj'))[0];
    if (xcodeProj === undefined) {
      throw new Error('no xcodeproj found');
    }

    const { moduleName: configModuleName } = await readConfig();

    const moduleName =
      customModuleName ?? configModuleName ?? (await guessModuleName());

    if (typeof moduleName !== 'string') {
      throw new Error(
        "moduleName couldn't be guessed. config in package.json -> komondor.moduleName or --module-name or env KOMONDOR_APP_MODULE_NAME"
      );
    }

    console.log(moduleName);

    const pbxprojPath = path.join(xcodeProj, 'project.pbxproj');
    console.log(`patching ${xcodeProj}`);
    const project = xcode.project(pbxprojPath);
    project.parseSync();
    const target = project.getTarget('com.apple.product-type.application');
    if (target === null) {
      throw new Error("Couldn't find app target");
    }
    console.log(`Found target ${target.target.name}`);

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
        'if [[ -z "${KOMONDOR_ENABLED}" ]]; then',
        '  echo "komondor not enabled, skipping"',
        'else',
        '  WITH_ENVIRONMENT="../node_modules/react-native/scripts/xcode/with-environment.sh"',
        '  KOMONDOR_CLI="../node_modules/komondor/dist/bin/komondor-cli.js patch-info-plist"',
        '  source $WITH_ENVIRONMENT',
        '  $NODE_BINARY $KOMONDOR_CLI "$CONFIGURATION_BUILD_DIR/$INFOPLIST_PATH"',
        'fi',
      ].join('\n')
    );

    addBuildPhaseIfNeeded('[Komondor] Add Komondor UI bundle', () =>
      [
        'if [[ -z "${KOMONDOR_ENABLED}" ]]; then',
        '  echo "komondor not enabled, skipping"',
        'else',
        '  echo "Adding komondor.jsbundle package"',
        `  sed "s/bf4eb35237c40d159eaad6d2965df9a3b0934879/${moduleName}/" ../node_modules/komondor/dist/ui/main.jsbundle > "$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/komondor.jsbundle"`,
        'fi',
      ].join('\n')
    );

    console.log(`writing ${pbxprojPath}`);
    const buffer = project.writeSync();
    await writeFile(pbxprojPath, buffer);
  },
});
