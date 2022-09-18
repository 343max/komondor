import { open } from 'fs/promises';

export const readFile = async (path: string) => {
  const f = await open(path);
  const content = await f.readFile({ encoding: 'utf-8' });
  f.close();
  return content;
};

export const writeFile = async (path: string, content: string) => {
  const fw = await open(path, 'w');
  fw.writeFile(content);
  await fw.close();
};
