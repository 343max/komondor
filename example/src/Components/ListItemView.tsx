import React from 'react';
import { Text, TouchableHighlight, View } from 'react-native';
import { textStyle } from '../lib/styles';
import { tw } from '../tw';
import type { ListItem } from './List';

export const ListItemView = <T extends ListItem>(
  item: T,
  index: number,
  items: T[],
  onPress: (item: T) => void
): JSX.Element => {
  return (
    <View
      key={item.title}
      style={
        index + 1 < items.length
          ? tw`border-b border-black/10 dark:border-white/20`
          : undefined
      }
    >
      <View style={tw`bg-gray-300 dark:bg-gray-800`}>
        <TouchableHighlight
          disabled={item.disabled}
          style={tw`p-2 min-h-[44px] pt-1.5 bg-white dark:bg-gray-600`}
          onPress={() => {
            setTimeout(() => onPress(item), 50);
          }}
          underlayColor="rgba(0,0,0,0)"
        >
          <View style={tw`flex-row justify-between items-center`}>
            <Text
              style={[
                tw`text-lg font-medium `,
                textStyle,
                item.disabled ? tw`opacity-25` : undefined,
              ]}
            >
              {item.title}
            </Text>
            {item.accessoryItem}
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};
