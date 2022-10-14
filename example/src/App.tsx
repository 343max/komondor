import * as React from 'react';

import { SafeAreaView, ScrollView, Share } from 'react-native';
import { getUrlSchemes } from 'komondor';
import { List } from './Components/List';
import { tw } from './tw';
import { useDeviceContext } from 'twrnc';
import { useAsyncMemo } from './lib/useAsyncMemo';
import { PackagerList } from './Components/PackagerList';

export default function App() {
  useDeviceContext(tw);

  const urlSchemes = useAsyncMemo(getUrlSchemes, [], []);

  return (
    <SafeAreaView style={tw`bg-slate-200 dark:bg-slate-700`}>
      <ScrollView style={tw`w-full h-full p-3 `}>
        <PackagerList />
        <List
          header="URL Schemes"
          items={urlSchemes.map((title) => ({ title }))}
          onPress={({ title }) => Share.share({ message: title })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
