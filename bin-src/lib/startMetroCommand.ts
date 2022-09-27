import Bonjour from 'bonjour-service';
import { command, number, option, optional, string } from 'cmd-ts';
import { readConfig, readPackageJson } from './package-json';
import { spawn } from 'child_process';
import { createHash } from 'crypto';
import { getComputerName } from './getComputerName';
import { getGitBranch, getGitRepo } from './getGitRepo';

const generatePort = (): number => {
  // generate a stable port number based on the current path
  const path = process.cwd();
  const hash = createHash('sha256').update(path).digest('hex');
  return (parseInt(hash.substring(0, 8), 16) % 600) + 8100;
};

export const startMetroCommand = command({
  name: 'start-metro',
  args: {
    customPort: option({
      type: optional(number),
      long: 'port',
      short: 'p',
      env: 'KOMONDOR_PORT',
      description: 'metro port',
    }),
    customStartCommand: option({
      type: optional(string),
      long: 'command',
      short: 'c',
      env: 'KOMONDOR_PACKAGER_COMMAND',
      description: 'Command to run. Default: `npx react-native start`',
    }),
  },
  handler: async ({ customPort, customStartCommand }) => {
    const { startCmd, metroPort } = await readConfig();
    const port =
      customPort ?? (metroPort ? parseInt(`${metroPort}`) : generatePort());
    const command = `${customStartCommand ?? startCmd} --port ${port}`;
    const bonjour = new Bonjour();
    const packageJson = await readPackageJson();
    const appName = `${packageJson.name}`;
    const repo = getGitRepo();
    const branch = getGitBranch();

    process.on('SIGINT', () => {
      console.log('exit');
      bonjour.unpublishAll();
      bonjour.destroy();
      process.exit();
    });

    bonjour.publish({
      name: `${appName} @ ${getComputerName()}`,
      type: 'http',
      port,
      txt: {
        service: 'komondor',
        moduleName: appName,
        repo,
        branch,
      },
    });

    console.log(`running ${command}`);

    const [bin, ...args] = command.split(' ');

    const child = spawn(bin ?? '', args, {
      stdio: [process.stdin, process.stdout, process.stderr],
    });

    child.on('exit', () => {
      bonjour.unpublishAll();
      bonjour.destroy();
    });
  },
});
