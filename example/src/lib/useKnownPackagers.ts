import { useDefaultsStore } from './useDefaultsStore';

export const useKnownPackagers = (): {
  recentPackagers: string[];
  addRecentPackager: (host: string) => Promise<void>;
  favoritePackagers: string[];
  toggleFavoritePackager: (host: string) => Promise<void>;
} => {
  const [recentPackagers, setRecentPackagers] = useDefaultsStore<
    string[],
    string[]
  >('recentPackagers', []);

  const [favoritePackagers, setFavoritePackagers] = useDefaultsStore<
    string[],
    string[]
  >('starredPackagers', []);

  return {
    recentPackagers,
    addRecentPackager: async (host) => {
      if (!recentPackagers.includes(host)) {
        await setRecentPackagers([...recentPackagers.slice(-9), host]);
      }
    },
    favoritePackagers,
    toggleFavoritePackager: async (host) => {
      await setFavoritePackagers(
        favoritePackagers.includes(host)
          ? favoritePackagers.filter((v) => v !== host)
          : [...favoritePackagers, host]
      );
    },
  };
};
