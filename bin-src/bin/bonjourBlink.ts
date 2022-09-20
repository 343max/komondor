import Bonjour from 'bonjour-service';
import { getComputerName } from '../lib/getComputerName';
import { sleep } from '../lib/sleep';

const main = async () => {
  const bonjour = new Bonjour();

  process.on('SIGINT', () => {
    console.log('exit');
    bonjour.unpublishAll();
    bonjour.destroy();
    process.exit();
  });

  while (true) {
    console.log('on');
    bonjour.publish({
      name: `bonjourBlink @ ${getComputerName()}`,
      type: 'http',
      port: 8099,
      txt: {
        service: 'komondor',
        moduleName: 'bonjourBlink',
      },
    });
    await sleep(2000);
    console.log('off');
    await new Promise((resolve) => bonjour.unpublishAll(resolve));
    await sleep(1000);
  }
};

main();
