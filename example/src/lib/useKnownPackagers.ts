import { useDefaultsStore } from './useDefaultsStore';

export const useKnownPackagers = (): {
  favoritePackagers: string[];
  toggleFavoritePackager: (host: string) => Promise<void>;
} => {
  const [favoritePackagers, setFavoritePackagers] = useDefaultsStore<
    string[],
    string[]
  >('starredPackagers', []);

  return {
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
