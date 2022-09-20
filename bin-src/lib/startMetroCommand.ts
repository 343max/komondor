import Bonjour from 'bonjour-service';
import { command, number, option, optional } from 'cmd-ts';
import { readPackageJson } from './package-json';
import { sleep } from './sleep';
// import { hostname } from 'os';
import { execSync } from 'child_process';

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
    const port = customPort ?? 8080;
    const bonjour = new Bonjour();
    const packageJson = await readPackageJson();
    const appName = `${packageJson.name}`;
    const computerName = execSync('scutil --get ComputerName')
      .toString()
      .trim();

    console.log(computerName);

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
      await sleep(1000);
      console.log('off');
      await unpublishAll();
      await sleep(1000);
    }
  },
});
