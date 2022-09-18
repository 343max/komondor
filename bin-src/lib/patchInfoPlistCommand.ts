import { command, positional, string } from "cmd-ts";
import { ConfigEnvKey } from "./package-json";
import { readPlistFile, writePlistFile } from "./plist";

export const patchInfoPlistCommand = command({
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
