import type { Profile } from './types';

/**
 * v1 ships with one conservative profile. Profile-specific rulings
 * (`profileOverrides` in the knowledge base) are only added from sources
 * the founder has provided and reviewed.
 */
export const DEFAULT_PROFILE: Profile = {
  id: 'default-conservative',
  name: 'Conservative (default)',
  strictness: 'conservative',
  school: 'unspecified',
};

export const PROFILES: Profile[] = [DEFAULT_PROFILE];
