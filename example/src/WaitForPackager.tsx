import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { tw } from './tw';

export const WaitForPackager: React.FC = () => {
  const [fullWidth, setFullWidth] = React.useState(0);
  const [textOffset, setTextOffset] = React.useState(0);
  const [textWidth, setTextWidth] = React.useState(0);

  React.useEffect(
    () => setTextWidth(fullWidth - textOffset),
    [fullWidth, textOffset]
  );

  return (
    <View style={tw`p-3`}>
      <View style={tw`rounded-lg p-3 bg-gray-300 dark:bg-gray-500`}>
        <View
          style={tw`flex-row items-center`}
          onLayout={({ nativeEvent }) => setFullWidth(nativeEvent.layout.width)}
        >
          <ActivityIndicator color="white" />
          <View style={tw`w-[12px]`} />
          <Text
            style={tw`dark:text-white w-[${textWidth}px]`}
            onLayout={({ nativeEvent }) => setTextOffset(nativeEvent.layout.x)}
          >
            Waiting for packager to come online...
          </Text>
        </View>
      </View>
    </View>
  );
};
