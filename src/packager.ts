import { Komondor } from './Komondor';

const splitPort = (hostPort: string): { host: string; port: number } => {
  const [host, port] = hostPort.split(':');
  return {
    host: host ?? 'localhost',
    port: parseInt(port ?? '8081', 10) ?? 8081,
  };
};

export const switchToPackager = async (
  bundleHost: string,
  scheme = 'http'
): Promise<void> => {
  const { host, port } = splitPort(bundleHost);
  Komondor.switchToPackager(host, port, scheme);
};
export const isPackagerRunning = async (
  bundleHost: string,
  scheme = 'http'
): Promise<boolean> => {
  const { host, port } = splitPort(bundleHost);
  return await Komondor.isPackagerRunning(host, port, scheme);
};
