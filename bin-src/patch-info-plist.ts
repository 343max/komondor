#!/usr/bin/env node

import { run, command, positional, string } from 'cmd-ts';
import { open } from 'fs/promises';
import plist from 'plist';

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
};

const readBdeConfig = async (): Promise<Config> => ({
  displayName: '$(PRODUCT_NAME) Dev',
  bundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER).bde',
  protocolHandler: '$(PRODUCT_BUNDLE_IDENTIFIER).bde',
  ...(await readPackageJson()).betterDevExp,
});

const app = command({
  name: 'patch-protocol-handler',
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

run(app, process.argv.slice(2));
