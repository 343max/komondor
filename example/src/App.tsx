import * as React from 'react';

import { SafeAreaView, ScrollView, Share } from 'react-native';
import {
  getUrlSchemes,
  hasNotSwitched,
  supportsLocalDevelopment,
  switchToPackager,
} from 'better-dev-exp';
import { List } from './List';
import { tw } from './tw';
import { useRunningPackagers } from './lib/useRunningPackagers';
import { useDeviceContext } from 'twrnc';
import { WaitForPackager } from './WaitForPackager';
import { StarButton } from './StarButton';
import { useHandleUrl } from './lib/useHandleUrl';
import { parseAppUrl } from './lib/parseAppUrl';
import { useAsyncMemo } from './lib/useAsyncMemo';
import { useRecentPackagers } from './lib/useRecentPackagers';
import { useAsyncEffect } from './lib/useAsyncEffect';

export default function App() {
  useDeviceContext(tw);

  const [requestedPackager, setRequestedPackager] = React.useState<string>();

  useHandleUrl((url) => {
    const urlAction = parseAppUrl(url);

    if (urlAction?.action === 'switch-to-host') {
      setRequestedPackager(urlAction.host);
    }
  });

  const urlSchemes = useAsyncMemo(getUrlSchemes, [], []);
  const isDevMachine = useAsyncMemo(supportsLocalDevelopment, [], false);
  const isInitialRun = useAsyncMemo(hasNotSwitched, [], false);

  const [starredPackagers, setStarredPackagers] = React.useState<string[]>([]);

  const watchedPackagers = React.useMemo(
    () => [
      ...(isDevMachine ? ['localhost:8080'] : []),
      ...(isInitialRun ? starredPackagers : []),
      ...(requestedPackager ? [requestedPackager] : []),
    ],
    [isDevMachine, isInitialRun, starredPackagers, requestedPackager]
  );
  const { recentPackagers, addRecentPackager } = useRecentPackagers();

  const runningPackagers = useRunningPackagers([
    ...watchedPackagers,
    ...recentPackagers,
  ]);

  useAsyncEffect(async () => {
    const pickedPackager = runningPackagers.find((p) =>
      watchedPackagers.includes(p)
    );

    if (pickedPackager !== undefined) {
      await addRecentPackager(pickedPackager);
      switchToPackager(pickedPackager).catch((exception) =>
        console.log(exception)
      );
    }
  }, [runningPackagers, watchedPackagers]);

  const packagerItems = React.useMemo(
    () =>
      recentPackagers.map((host) => {
        const running = runningPackagers.includes(host);
        return {
          title: host,
          disabled: !running,
          accessoryItem: (
            <StarButton
              starred={starredPackagers.includes(host)}
              style={tw`mr-2`}
              onPress={() =>
                setStarredPackagers(
                  starredPackagers.includes(host)
                    ? starredPackagers.filter((v) => v !== host)
                    : [...starredPackagers, host]
                )
              }
            />
          ),
        };
      }),
    [recentPackagers, runningPackagers, starredPackagers]
  );

  return (
    <SafeAreaView style={tw`bg-slate-200 dark:bg-slate-700`}>
      <ScrollView style={tw`w-full h-full p-3 `}>
        {watchedPackagers.length > 0 ? <WaitForPackager /> : null}
        <List
          header="Recent Dev Endpoints"
          items={packagerItems}
          onPress={({ title }) => {
            switchToPackager(title).catch((exception) =>
              console.log(exception)
            );
          }}
        />
        <List
          header="URL Schemes"
          items={urlSchemes.map((title) => ({ title }))}
          onPress={({ title }) => Share.share({ message: title })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
