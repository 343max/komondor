import { useDefaultsStore } from './useDefaultsStore';

export const useRecentPackagers = (): {
  recentPackagers: string[];
  addRecentPackager: (host: string) => Promise<void>;
} => {
  const [recentPackagers, setRecentPackagers] = useDefaultsStore<
    string[],
    string[]
  >('recentPackagers', []);

  return {
    recentPackagers,
    addRecentPackager: async (host) => {
      if (!recentPackagers.includes(host)) {
        await setRecentPackagers([...recentPackagers.slice(-9), host]);
      }
    },
  };
};
