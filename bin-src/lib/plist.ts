import plist from 'simple-plist';
import { promisify } from 'util';

export const readPlistFile = promisify(plist.readFile);
export const writePlistFile = promisify(plist.writeBinaryFile);
