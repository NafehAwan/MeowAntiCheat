import type { VerdictStatus } from '@halal/rules';

export const colors = {
  background: '#FFFFFF',
  surface: '#F3F5F4',
  text: '#111816',
  textMuted: '#5B6662',
  border: '#DDE3E0',
  primary: '#0F7B4A',
  onPrimary: '#FFFFFF',
} as const;

export const verdictColors: Record<VerdictStatus, { bg: string; fg: string }> = {
  halal: { bg: '#0F7B4A', fg: '#FFFFFF' },
  doubtful: { bg: '#C98A00', fg: '#FFFFFF' },
  haram: { bg: '#B3261E', fg: '#FFFFFF' },
  unknown: { bg: '#5B6662', fg: '#FFFFFF' },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
