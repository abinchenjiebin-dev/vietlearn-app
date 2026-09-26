import React from 'react';
import { View } from 'react-native';

import { TopicGrid } from '../../components/TopicGrid';
import { TabHeader } from '../../components/ui';

export default function Vocab() {
  return (
    <View style={{ flex: 1 }}>
      <TabHeader title="词汇" />
      <TopicGrid kind="words" />
    </View>
  );
}
