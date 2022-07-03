import * as React from 'react';

import { ScrollView, Share } from 'react-native';
import { getUrlSchemes } from 'better-dev-exp';
import { List } from './List';
import { tw } from './tw';

export default function App() {
  const [urlSchemes, setUrlSchemes] = React.useState<string[]>([]);

  React.useEffect(() => {
    getUrlSchemes().then(setUrlSchemes);
  }, []);

  return (
    <ScrollView style={tw`w-full h-full p-3 bg-slate-200`}>
      <List
        header="Cached Packages"
        items={[
          { title: 'PR 42 - new feature' },
          { title: 'PR 23 - another feature' },
        ]}
      />
      <List
        header="URL Schemes"
        items={urlSchemes.map((title) => ({ title }))}
        onPress={({ title }) => Share.share({ message: title })}
      />
    </ScrollView>
  );
}
