import { execSync } from 'child_process';

export const getComputerName = (): string => {
  try {
    return execSync('scutil --get ComputerName', {
      stdio: ['pipe', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return execSync('hostname').toString().trim();
  }
};
