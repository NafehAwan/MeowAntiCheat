import type { Analysis, Flag, WhyItem } from '@halal/rules';
import { StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { REQUIRE_REVIEWED_KB } from '@/lib/config';
import { colors, spacing, verdictColors } from '@/lib/theme';

function whyText(item: WhyItem): string {
  switch (item.code) {
    case 'nothing-flagged':
      return t('why.nothing-flagged', { count: item.count });
    case 'haram-found':
    case 'doubtful-found':
      return t(`why.${item.code}`, { names: item.names.join(', ') });
    default:
      return t(`why.${item.code}`);
  }
}

export function VerdictBadge({ verdict }: { verdict: Analysis['verdict'] }) {
  const c = verdictColors[verdict];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]} accessibilityRole="header">
      <Text style={[styles.badgeText, { color: c.fg }]}>{t(`verdict.${verdict}`)}</Text>
      <Text style={[styles.badgeSub, { color: c.fg }]}>{t(`verdict.${verdict}.sub`)}</Text>
    </View>
  );
}

function FlagRow({ flag }: { flag: Flag }) {
  const c = verdictColors[flag.status];
  return (
    <View style={styles.flag}>
      <View style={styles.flagHeader}>
        <View style={[styles.pill, { backgroundColor: c.bg }]}>
          <Text style={[styles.pillText, { color: c.fg }]}>{t(`verdict.${flag.status}`)}</Text>
        </View>
        <Text style={styles.flagName}>{flag.name}</Text>
      </View>
      <Text style={styles.flagReason}>{flag.reason}</Text>
      <Text style={styles.muted}>{t('flagged.label', { ingredient: flag.ingredient })}</Text>
      {flag.shownAsDoubtfulBecauseUnreviewed && <Text style={styles.muted}>{t('flagged.unreviewed')}</Text>}
    </View>
  );
}

export function Disclaimer() {
  return <Text style={styles.disclaimer}>{t('disclaimer')}</Text>;
}

export function VerdictView({ analysis }: { analysis: Analysis }) {
  return (
    <View style={styles.container}>
      {!REQUIRE_REVIEWED_KB && <Text style={styles.banner}>{t('testBuild.banner')}</Text>}
      <VerdictBadge verdict={analysis.verdict} />

      {analysis.flagged.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('flagged.title')}</Text>
          {analysis.flagged.map((f, i) => (
            <FlagRow key={`${f.entryId}-${i}`} flag={f} />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('why.title')}</Text>
        {analysis.why.map((w, i) => (
          <Text key={i} style={styles.body}>
            • {whyText(w)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  banner: {
    backgroundColor: '#FFF4D6',
    color: '#6B4E00',
    padding: spacing.sm,
    borderRadius: 8,
    fontSize: 13,
  },
  badge: { borderRadius: 20, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, alignItems: 'center' },
  badgeText: { fontSize: 40, fontWeight: '800' },
  badgeSub: { fontSize: 15, marginTop: spacing.xs, textAlign: 'center', opacity: 0.95 },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 21 },
  muted: { fontSize: 13, color: colors.textMuted },
  flag: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, gap: spacing.xs },
  flagHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  flagName: { fontSize: 16, fontWeight: '700', color: colors.text, flexShrink: 1 },
  flagReason: { fontSize: 15, color: colors.text },
  pill: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  pillText: { fontSize: 12, fontWeight: '700' },
  disclaimer: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
});
