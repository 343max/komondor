import Bonjour from 'bonjour-service';
import { command, number, option, optional } from 'cmd-ts';
import { readPackageJson } from './package-json';
import { sleep } from './sleep';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

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
      description: 'metro port',
    }),
  },
  handler: async ({ customPort }) => {
    const port = customPort ?? generatePort();
    const bonjour = new Bonjour();
    const packageJson = await readPackageJson();
    const appName = `${packageJson.name}`;
    const computerName = execSync('scutil --get ComputerName')
      .toString()
      .trim();

    process.on('SIGINT', () => {
      console.log('exit');
      bonjour.unpublishAll(() => process.exit());
    });

    const unpublishAll = async () =>
      new Promise((resolve) => bonjour.unpublishAll(resolve));

    while (true) {
      console.log('on');
      bonjour.publish({
        name: `${appName} @ ${computerName}`,
        type: 'http',
        port,
        txt: {
          service: 'komondor',
          moduleName: appName,
        },
      });
      console.log('listening...');
      await sleep(10000);
      console.log('off');
      await unpublishAll();
      await sleep(1000);
    }
  },
});
