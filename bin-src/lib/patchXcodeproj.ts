import { command, option, optional, string } from 'cmd-ts';
import { glob } from './glob-promise';
import path from 'path';
import xcode from 'xcode';
import { writeFile } from './file';

export const patchXcodeproj = command({
  name: 'patch-xcodeproj',
  description: 'Add Komondor Build Phases to you Xcode Project',
  args: {
    providedXcodeproj: option({
      type: optional(string),
      long: 'xcproj',
      short: 'p',
      description: 'path to the xcodeproj to patch. Default: ios/*.xcodeproj',
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
            '  KOMONDOR_CLI="../node_modules/komondor/dist/bin/komondor-cli.js patch-info-plist ${TARGET_BUILD_DIR}/${INFOPLIST_PATH}"',
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
