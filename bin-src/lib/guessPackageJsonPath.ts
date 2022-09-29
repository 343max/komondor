import { existsSync } from 'fs';
import { join } from 'path';

export const guessPackageJsonPath = (): string | null => {
  if (
    process.env.npm_package_json !== undefined &&
    existsSync(process.env.npm_package_json)
  ) {
    return process.env.npm_package_json;
  } else if (
    process.env.PWD !== undefined &&
    existsSync(join(process.env.PWD, 'package.json'))
  ) {
    return join(process.env.PWD, 'package.json');
  } else {
    return null;
  }
};
