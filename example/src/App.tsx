import * as React from 'react';

import { SafeAreaView, ScrollView } from 'react-native';
import { tw } from './tw';
import { useDeviceContext } from 'twrnc';
import { PackagerList } from './Components/PackagerList';
import { URLSchemeList } from './Components/URLSchemeList';

export default function App() {
  useDeviceContext(tw);

  return (
    <SafeAreaView style={tw`bg-slate-200 dark:bg-slate-700`}>
      <ScrollView style={tw`w-full h-full p-3 `}>
        <PackagerList />
        <URLSchemeList />
      </ScrollView>
    </SafeAreaView>
  );
}
