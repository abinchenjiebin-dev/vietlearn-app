import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';

import { Text } from '../components/Text';
import { Button, IconName, tap } from '../components/ui';
import { useProgress } from '../lib/progress';
import { DRILL_SIZES } from '../lib/quiz';
import { speakVi } from '../lib/speech';
import { radius, Theme, useStyles, useTheme } from '../theme';

const GOALS = [10, 20, 30, 50];
const SCALES = [
  { v: 0.9, label: '小' },
  { v: 1, label: '标准' },
  { v: 1.12, label: '大' },
  { v: 1.25, label: '特大' },
];

export default function Settings() {
  const p = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [confirm, setConfirm] = useState(false);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Group title="学习">
        <Row icon="flag" color="#E4572E" title="每日目标" sub="每天完成多少次练习算达标">
          <Segment value={p.goal} options={GOALS.map((g) => ({ v: g, label: `${g}` }))} onChange={p.setGoal} />
        </Row>
        <Row icon="flash" color={c.primary} title="每日一刷题量" last>
          <Segment value={p.drillSize} options={DRILL_SIZES.map((n) => ({ v: n, label: `${n}` }))} onChange={p.setDrillSize} />
        </Row>
      </Group>

      <Group title="发音">
        <Row
          icon="volume-high"
          color="#2A9D8F"
          title="自动朗读"
          sub="翻单词卡片、复习新词时自动读出来（听力题不受影响）"
          right={
            <Switch
              value={p.autoPlay}
              onValueChange={(v) => { tap(); p.updateSettings({ autoPlay: v }); }}
              trackColor={{ true: c.primary, false: c.border }}
              thumbColor="#fff"
              // 网页版打开时的滑块颜色要单独指定
              {...({ activeThumbColor: '#fff' } as object)}
            />
          }
        />
        <Row icon="person" color="#E76F51" title="发音人">
          <Segment
            value={p.voice}
            options={[
              { v: 'female', label: '女声' },
              { v: 'male', label: '男声' },
            ]}
            onChange={(v) => {
              p.updateSettings({ voice: v });
              setTimeout(() => speakVi('Xin chào, rất vui được gặp bạn.'), 50);
            }}
          />
          <Text style={s.hint}>都是北部（河内）标准口音</Text>
        </Row>
        <Row icon="speedometer" color="#3E7CB1" title="语速" last>
          <Segment
            value={p.speechRate}
            options={[
              { v: 'slow', label: '慢' },
              { v: 'normal', label: '正常' },
              { v: 'fast', label: '快' },
            ]}
            onChange={(v) => {
              p.updateSettings({ speechRate: v });
              // 等设置生效后再试听
              setTimeout(() => speakVi('Xin chào, rất vui được gặp bạn.'), 50);
            }}
          />
          <Text style={s.hint}>切换后会自动试听一句</Text>
        </Row>
      </Group>

      <Group title="显示">
        <Row icon="contrast" color="#6D597A" title="外观">
          <Segment
            value={p.appearance}
            options={[
              { v: 'system', label: '跟随系统' },
              { v: 'light', label: '浅色' },
              { v: 'dark', label: '深色' },
            ]}
            onChange={(v) => p.updateSettings({ appearance: v })}
          />
        </Row>
        <Row icon="text" color="#D1A21F" title="文字大小" last>
          <Segment value={p.textScale} options={SCALES} onChange={(v) => p.updateSettings({ textScale: v })} />
          <Text style={s.preview}>
            Cảm ơn bạn. <Text style={s.previewZh}>谢谢你。</Text>
          </Text>
        </Row>
      </Group>

      <Group title="数据">
        <View style={s.pad}>
          <Text style={s.sub}>清空后，掌握的词、复习计划、错题本、打卡记录、收藏都会删除，设置会保留。</Text>
          <Button
            label={confirm ? '确定要清空吗？再点一次' : '清空学习记录'}
            kind={confirm ? 'danger' : 'ghost'}
            icon="trash-outline"
            style={{ marginTop: 10 }}
            onPress={() => {
              if (!confirm) return setConfirm(true);
              p.reset();
              setConfirm(false);
            }}
          />
        </View>
      </Group>

      <Text style={s.about}>越南语学堂 · 学习记录只保存在这台设备上</Text>
    </ScrollView>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const s = useStyles(makeStyles);
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={s.groupTitle}>{title}</Text>
      <View style={s.group}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  color,
  title,
  sub,
  right,
  last,
  children,
}: {
  icon: IconName;
  color: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  last?: boolean;
  children?: React.ReactNode;
}) {
  const s = useStyles(makeStyles);
  return (
    <View style={[s.row, !last && s.divider]}>
      <View style={s.rowHead}>
        <View style={[s.icon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={15} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{title}</Text>
          {sub ? <Text style={s.sub}>{sub}</Text> : null}
        </View>
        {right}
      </View>
      {children ? <View style={{ marginTop: 10 }}>{children}</View> : null}
    </View>
  );
}

function Segment<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.segment}>
      {options.map((o) => {
        const on = o.v === value;
        return (
          <Pressable key={String(o.v)} onPress={() => { tap(); onChange(o.v); }} style={[s.seg, on && s.segOn]}>
            <Text style={[s.segText, on && s.segTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  groupTitle: { fontSize: 12, color: c.sub, fontWeight: '600' as const, marginBottom: 6, marginLeft: 4 },
  group: { backgroundColor: c.card, borderRadius: radius.md, ...shadow },
  row: { padding: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: c.border },
  rowHead: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  icon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center' as const, justifyContent: 'center' as const },
  title: { fontSize: 15, fontWeight: '600' as const, color: c.text },
  sub: { fontSize: 12, color: c.sub, marginTop: 2, lineHeight: 17 },
  hint: { fontSize: 11, color: c.faint, marginTop: 6 },
  preview: { fontSize: 17, fontWeight: '600' as const, color: c.text, marginTop: 10 },
  previewZh: { fontSize: 14, fontWeight: '400' as const, color: c.sub },
  pad: { padding: 12 },
  segment: { flexDirection: 'row' as const, backgroundColor: c.cardAlt, borderRadius: radius.sm, padding: 3 },
  seg: { flex: 1, alignItems: 'center' as const, paddingVertical: 7, borderRadius: 8 },
  segOn: { backgroundColor: c.card, ...shadow },
  segText: { fontSize: 13, color: c.sub, fontWeight: '600' as const },
  segTextOn: { color: c.primary },
  about: { textAlign: 'center' as const, color: c.faint, fontSize: 11, marginTop: 6 },
});
