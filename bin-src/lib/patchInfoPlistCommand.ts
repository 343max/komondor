import { command, positional, string } from 'cmd-ts';
import { ConfigEnvKey } from './package-json';
import { readPlistFile, writePlistFile } from './plist';

export const patchInfoPlistCommand = command({
  name: 'patch-info-plist',
  description:
    'patches the Info.plist file of the app during build. Should only be run by the Xcode build process.',
  args: {
    plistPath: positional({ type: string, displayName: 'plist path' }),
  },
  handler: async ({ plistPath }) => {
    const dict = (await readPlistFile<any>(plistPath))!;

    dict.CFBundleURLTypes = [
      ...(dict.CFBundleURLTypes ?? []),
      {
        CFBundleURLName: process.env.PRODUCT_BUNDLE_IDENTIFIER,
        CFBundleURLSchemes: [process.env[ConfigEnvKey.protocolHandler]],
      },
    ];

    dict.CFBundleDisplayName = process.env[ConfigEnvKey.displayName];
    dict.CFBundleIdentifier = process.env.PRODUCT_BUNDLE_IDENTIFIER;

    dict.NSAppTransportSecurity = { NSAllowsArbitraryLoads: true };

    dict.NSBonjourServices = ['_http._tcp.'];

    if (dict.ITSAppUsesNonExemptEncryption === undefined) {
      dict.ITSAppUsesNonExemptEncryption = false;
    }

    dict['UISupportedInterfaceOrientations~ipad'] = [
      'UIInterfaceOrientationLandscapeLeft',
      'UIInterfaceOrientationLandscapeRight',
      'UIInterfaceOrientationPortrait',
      'UIInterfaceOrientationPortraitUpsideDown',
    ];

    await writePlistFile(plistPath, dict);
    console.log(`komondor patched ${plistPath}`);
  },
});
