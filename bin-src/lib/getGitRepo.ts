import { execSync } from 'child_process';

export const getGitRepo = (): string =>
  execSync('git remote get-url origin').toString().trim();

export const getGitBranch = (): string =>
  execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
