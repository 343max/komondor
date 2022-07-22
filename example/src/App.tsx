import * as React from 'react';

import { Alert, SafeAreaView, ScrollView, Share } from 'react-native';
import { switchToPackager } from 'better-dev-exp';
import { List, ListItem } from './List';
import { tw } from './tw';
import { useRunningPackagers } from './lib/useRunningPackagers';
import { useDeviceContext } from 'twrnc';
import { WaitForPackager } from './WaitForPackager';
import { useUrlSchemes } from './lib/useUrlSchemes';
import { useIsInitialRun } from './lib/useIsInitialRun';
import { StarButton } from './StarButton';
import { useHandleUrl } from './lib/useHandleUrl';

export default function App() {
  useDeviceContext(tw);

  const handleUrl = useHandleUrl((url) => {
    Alert.alert(url);
  });
  const urlSchemes = useUrlSchemes();
  const isInitialRun = useIsInitialRun();

  React.useEffect(() => {
    if (handleUrl !== undefined) {
      Alert.alert(handleUrl);
    }
  }, [handleUrl]);

  const [starredPackagers, setStarredPackagers] = React.useState<string[]>([]);

  const [allPackagers, setAllPackagers] = React.useState<string[]>([
    'localhost:8088',
  ]);

  const runningPackagers = useRunningPackagers(allPackagers);

  const [packagers, setPackagers] = React.useState<ListItem[]>([]);

  React.useEffect(() => {
    setPackagers(
      allPackagers.map((host) => {
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
      })
    );
  }, [allPackagers, runningPackagers]);

  return (
    <SafeAreaView style={tw`bg-slate-200 dark:bg-slate-700`}>
      <ScrollView style={tw`w-full h-full p-3 `}>
        {isInitialRun && starredPackagers.length > 0 ? (
          <WaitForPackager />
        ) : null}
        <List
          header="Recent Dev Endpoints"
          items={packagers}
          onPress={({ title }) =>
            switchToPackager(title).catch((exception) => console.log(exception))
          }
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
