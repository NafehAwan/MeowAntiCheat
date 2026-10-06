import { analyze, DEFAULT_PROFILE } from '@halal/rules';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Disclaimer, VerdictBadge, VerdictView } from '@/components/VerdictView';
import { t } from '@/i18n';
import { REQUIRE_REVIEWED_KB } from '@/lib/config';
import { lookupProduct, type LookupResult } from '@/lib/openFoodFacts';
import { colors, spacing } from '@/lib/theme';

export default function ProductScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const [result, setResult] = useState<LookupResult | null>(null);

  const load = useCallback(() => {
    setResult(null);
    lookupProduct(String(barcode)).then(setResult);
  }, [barcode]);

  useEffect(load, [load]);

  const product = result?.kind === 'found' ? result.product : null;
  const analysis = useMemo(
    () =>
      product?.ingredientsText
        ? analyze(product.ingredientsText, { profile: DEFAULT_PROFILE, requireReviewed: REQUIRE_REVIEWED_KB })
        : null,
    [product]
  );

  if (!result) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>{t('product.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {product && (
        <View>
          <Text style={styles.productName}>{product.name ?? t('product.unnamed')}</Text>
          {product.brand && <Text style={styles.muted}>{product.brand}</Text>}
        </View>
      )}
      <Text style={styles.muted}>{t('product.barcode', { code: String(barcode) })}</Text>

      {result.kind === 'error' && (
        <Message title={t('product.error.title')} body={t('product.error.body')} action={{ label: t('product.retry'), onPress: load }} />
      )}

      {result.kind === 'not-found' && (
        <>
          <VerdictBadge verdict="unknown" />
          <Message title={t('product.notFound.title')} body={t('product.notFound.body')} footer={t('product.photoComingSoon')} />
        </>
      )}

      {product && !analysis && (
        <>
          <VerdictBadge verdict="unknown" />
          <Message title={t('product.noIngredients.title')} body={t('product.noIngredients.body')} footer={t('product.photoComingSoon')} />
        </>
      )}

      {product && analysis && (
        <>
          {product.ingredientsNotEnglish && <Text style={styles.warning}>{t('product.otherLanguage')}</Text>}
          <VerdictView analysis={analysis} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('certification.title')}</Text>
            <Text style={styles.body}>
              {product.hasHalalLabel ? t('certification.halalLabel') : t('certification.none')}
            </Text>
            <Text style={styles.muted}>{t('certification.note')}</Text>
          </View>

          <Text style={styles.ingredients}>{product.ingredientsText}</Text>
        </>
      )}

      <Disclaimer />
      {product && <Text style={styles.muted}>{t('product.source')}</Text>}

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>{t('product.scanAnother')}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Message(props: { title: string; body: string; footer?: string; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{props.title}</Text>
      <Text style={styles.body}>{props.body}</Text>
      {props.footer && <Text style={styles.muted}>{props.footer}</Text>}
      {props.action && (
        <Pressable style={styles.button} onPress={props.action.onPress}>
          <Text style={styles.buttonText}>{props.action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  productName: { fontSize: 22, fontWeight: '700', color: colors.text },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 21 },
  muted: { fontSize: 13, color: colors.textMuted },
  warning: { backgroundColor: '#FFF4D6', color: '#6B4E00', padding: spacing.sm, borderRadius: 8, fontSize: 13 },
  ingredients: {
    fontSize: 13,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
});
