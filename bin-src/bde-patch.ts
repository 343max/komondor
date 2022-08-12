#!/usr/bin/env node

import { promise as glob } from 'glob-promise';
import { open } from 'fs/promises';

const patchConfiguration = 'release';
const baseConfiguration = 'debug';
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
    `ios/Pods/Target Support Files/*/*.${patchConfiguration}.xcconfig`
  );

  const patchComment = `// patched in by ${command}. Revert by running pod install again`;

  for (const configPath of configs) {
    const content = await readFile(configPath);
    const baseContent = await readFile(
      configPath.replace(
        `${patchConfiguration}.xcconfig`,
        `${baseConfiguration}.xcconfig`
      )
    );

    const preprocessorDefinitions = matchingLine(
      baseContent,
      /^GCC_PREPROCESSOR_DEFINITIONS/
    );

    if (content.includes(patchComment)) {
      console.log(`${configPath} already patched, skipping`);
    } else {
      const fw = await open(configPath, 'w');
      fw.writeFile(
        [
          patchComment,
          '',
          content,
          '// patched:',
          'SKIP_BUNDLING = YES',
          'RCT_NO_LAUNCH_PACKAGER = YES',
          `${preprocessorDefinitions} DEBUG=1`,
        ].join('\n')
      );
      await fw.close();
      console.log(`patched ${configPath}`);
    }
  }
};

main();
