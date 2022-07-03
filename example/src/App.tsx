import * as React from 'react';

import { StyleSheet, View, Text, TouchableOpacity, Share } from 'react-native';
import { getUrlSchemes } from 'better-dev-exp';

export default function App() {
  const [urlSchemes, setUrlSchemes] = React.useState<string[]>([]);

  React.useEffect(() => {
    getUrlSchemes().then(setUrlSchemes);
  }, []);

  return (
    <View style={styles.container}>
      <Text>URL schemes:</Text>
      {urlSchemes.map((scheme) => (
        <TouchableOpacity
          key={scheme}
          onPress={() => {
            Share.share({ message: scheme });
          }}
        >
          <Text>{scheme}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
