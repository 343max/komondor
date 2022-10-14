import React from 'react';
import { getUrlSchemes } from 'komondor';
import { Share } from 'react-native';
import { useAsyncMemo } from '../lib/useAsyncMemo';
import { List } from './List';

export const URLSchemeList: React.FC = () => {
  const urlSchemes = useAsyncMemo(getUrlSchemes, [], []);

  return (
    <List
      header="URL Schemes"
      items={urlSchemes.map((title) => ({ title }))}
      onPress={({ title }) => Share.share({ message: title })}
    />
  );
};
