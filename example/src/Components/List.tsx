import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '../tw';
import { ListItemView } from './ListItemView';

export type ListItem = {
  title: string;
  subtitle?: string;
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
        <ListItemView
          item={item}
          onPress={onPress}
          last={index + 1 < items.length}
        />
      ))}
    </View>
  </View>
);
