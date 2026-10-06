import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { isValidBarcode } from '@/lib/openFoodFacts';
import { colors, spacing } from '@/lib/theme';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  // The camera fires many events per second; only handle the first one.
  const handled = useRef(false);

  useFocusEffect(
    useCallback(() => {
      handled.current = false;
    }, [])
  );

  const onScanned = useCallback(({ data }: BarcodeScanningResult) => {
    if (handled.current || !isValidBarcode(data)) return;
    handled.current = true;
    router.push({ pathname: '/product/[barcode]', params: { barcode: data } });
  }, []);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{t('scan.permission.title')}</Text>
        <Text style={styles.body}>{t('scan.permission.body')}</Text>
        {permission.canAskAgain ? (
          <Pressable style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>{t('scan.permission.button')}</Text>
          </Pressable>
        ) : (
          <Text style={styles.body}>{t('scan.permission.settings')}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        onBarcodeScanned={onScanned}
      />
      <View style={styles.frame} pointerEvents="none" />
      <View style={styles.hintBox} pointerEvents="none">
        <Text style={styles.hint}>{t('scan.hint')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
  body: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  button: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: spacing.lg, borderRadius: 12 },
  buttonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
  frame: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    right: '10%',
    height: 160,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
  },
  hintBox: { position: 'absolute', bottom: 64, left: 0, right: 0, alignItems: 'center' },
  hint: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
