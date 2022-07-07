import * as React from 'react';

import { SafeAreaView, ScrollView, Share } from 'react-native';
import { getUrlSchemes, switchToPackager } from 'better-dev-exp';
import { List, ListItem } from './List';
import { tw } from './tw';
import { useRunningPackagers } from './lib/useRunningPackagers';

export default function App() {
  const [urlSchemes, setUrlSchemes] = React.useState<string[]>([]);

  React.useEffect(() => {
    getUrlSchemes().then(setUrlSchemes);
  }, []);

  const [allPackagers, setAllPackagers] = React.useState<string[]>([
    'localhost:8088',
    'localhost:8087',
  ]);
  const runningPackagers = useRunningPackagers(allPackagers);

  const [packagers, setPackagers] = React.useState<ListItem[]>([]);

  React.useEffect(() => {
    setPackagers(
      allPackagers.map((host) => {
        const running = runningPackagers.includes(host);
        return { title: host, disabled: !running };
      })
    );
  }, [allPackagers, runningPackagers]);

  return (
    <SafeAreaView style={tw`bg-slate-200`}>
      <ScrollView style={tw`w-full h-full p-3 `}>
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
