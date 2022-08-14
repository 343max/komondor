#!/usr/bin/env node

import { promise as glob } from 'glob-promise';
import { open } from 'fs/promises';

const releaseConfiguration = 'release';
const debugConfiguration = 'debug';
const command = process.argv.join(' ');

const readFile = async (path: string): Promise<string> => {
  const file = await open(path);
  const content = await file.readFile({ encoding: 'utf-8' });
  await file.close();
  return content;
};

const matchingLine = (
  file: string,
  matcher: { [Symbol.match](string: string): RegExpMatchArray | null }
) => file.split('\n').find((l) => l.match(matcher));

const main = async () => {
  const configs = await glob(
    `ios/Pods/Target Support Files/*/*.${releaseConfiguration}.xcconfig`
  );

  const patchComment = `// patched in by ${command}. Revert by running pod install again`;

  for (const releaseConfigPath of configs) {
    const releaseContent = await readFile(releaseConfigPath);
    const debugContent = await readFile(
      releaseConfigPath.replace(
        `${releaseConfiguration}.xcconfig`,
        `${debugConfiguration}.xcconfig`
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
};

main();
