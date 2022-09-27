import React from 'react';
import { Text, TouchableHighlight, View } from 'react-native';
import { textStyle } from '../lib/styles';
import { tw } from '../tw';
import type { ListItem } from './List';

export const ListItemView = <T extends ListItem>({
  item,
  last,
  onPress,
}: {
  item: T;
  last: boolean;
  onPress: (item: T) => void;
}) => {
  return (
    <View
      key={item.title}
      style={
        last ? tw`border-b border-black/10 dark:border-white/20` : undefined
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
            <View style={item.disabled ? tw`opacity-25` : undefined}>
              <Text style={[tw`text-lg font-medium `, textStyle]}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text style={[tw`text-sm font-medium opacity-66`, textStyle]}>
                  {item.subtitle}
                </Text>
              ) : null}
            </View>
            {item.accessoryItem}
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};
