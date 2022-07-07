import React from 'react';
import {
  Pressable,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { tw } from './tw';

export type ListItem = { title: string; disabled?: boolean };

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
    <Text style={tw`uppercase mb-2`}>{header}</Text>
    <View style={tw`rounded-lg overflow-hidden bg-white`}>
      {items.map((item, index) => (
        <View
          key={item.title}
          style={
            index + 1 < items.length ? tw`border-b border-gray-200` : undefined
          }
        >
          <TouchableHighlight
            disabled={item.disabled}
            style={tw`p-2 min-h-[44px] pt-1.5`}
            onPress={() => {
              setTimeout(() => onPress(item), 50);
            }}
            underlayColor="#e4e4e7"
          >
            <Text
              style={[
                tw`text-lg font-medium`,
                item.disabled ? tw`text-gray-300` : undefined,
              ]}
            >
              {item.title}
            </Text>
          </TouchableHighlight>
        </View>
      ))}
    </View>
  </View>
);
