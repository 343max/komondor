import React from 'react';
import { Text, TouchableHighlight, View } from 'react-native';
import { textStyle } from './lib/styles';
import { tw } from './tw';

export type ListItem = {
  title: string;
  disabled?: boolean;
  accessoryItem?: React.ReactElement;
};

type ListProps<T extends ListItem> = {
  header: string;
  items: T[];
  onPress?: (item: T) => void;
};

export const List = <T extends ListItem>({
  header,
  items,
  onPress = () => {},
}: ListProps<T>) => (
  <View style={tw`m-3`}>
    <Text style={tw`uppercase mb-2 dark:text-gray-400`}>{header}</Text>
    <View style={tw`rounded-lg overflow-hidden`}>
      {items.map((item, index) => (
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
      ))}
    </View>
  </View>
);
