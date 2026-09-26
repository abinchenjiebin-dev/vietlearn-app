import React from 'react';
import { View } from 'react-native';

import { TopicGrid } from '../../components/TopicGrid';
import { TabHeader } from '../../components/ui';

export default function Phrases() {
  return (
    <View style={{ flex: 1 }}>
      <TabHeader title="常用语" />
      <TopicGrid kind="phrases" />
    </View>
  );
}
