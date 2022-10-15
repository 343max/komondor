import { execSync } from 'child_process';

export const getFullUserName = (): string | null => {
  try {
    return execSync('id -F', {
      stdio: ['pipe', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
};

export const getShortUserName = (): string => {
  return execSync('id -u -n', {
    stdio: ['pipe', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
};
