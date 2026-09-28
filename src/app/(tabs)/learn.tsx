import React from 'react';
import { View } from 'react-native';

import { TopicGrid } from '../../components/TopicGrid';
import { TabHeader } from '../../components/ui';

/** 学习：所有主题，每个主题里有单词、常用语、对话 */
export default function Learn() {
  return (
    <View style={{ flex: 1 }}>
      <TabHeader title="学习" />
      <TopicGrid />
    </View>
  );
}
