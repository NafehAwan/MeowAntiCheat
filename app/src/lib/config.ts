import Constants from 'expo-constants';

/**
 * Production builds show unreviewed knowledge-base entries as doubtful.
 * Set per build profile in eas.json (EXPO_PUBLIC_REQUIRE_REVIEWED_KB).
 * Defaults to the safe value (true) if not set.
 */
export const REQUIRE_REVIEWED_KB = process.env.EXPO_PUBLIC_REQUIRE_REVIEWED_KB !== 'false';

export const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

const contact = (Constants.expoConfig?.extra?.offContactEmail as string | undefined) ?? '';

/** Open Food Facts asks apps to identify themselves: AppName/Version (contact). */
export const USER_AGENT = `HalalScanner/${APP_VERSION} (${contact})`;
