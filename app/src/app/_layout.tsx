import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { t } from '@/i18n';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="index" options={{ title: t('app.name') }} />
        <Stack.Screen name="product/[barcode]" options={{ title: t('product.title') }} />
      </Stack>
    </>
  );
}
