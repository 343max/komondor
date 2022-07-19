import React from 'react';
import { StyleProp, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { textStyle } from './lib/styles';
import { tw } from './tw';

export const StarButton: React.FC<{
  starred: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}> = ({ starred, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Text style={[textStyle, tw`text-lg opacity-70`]}>
      {starred ? '★' : '☆'}
    </Text>
  </TouchableOpacity>
);
