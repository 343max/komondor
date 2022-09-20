import { execSync } from 'child_process';

export const getComputerName = (): string =>
  execSync('scutil --get ComputerName').toString().trim();
