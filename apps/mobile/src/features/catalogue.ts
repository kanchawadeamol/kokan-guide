import type { MessageKey } from '../i18n/messages';

/**
 * Every feature shown on the home dashboard, with its access rule. This is the single source
 * of truth for "what needs login" (see docs/mobile/access.md):
 *
 * - public: anyone, including guests. Emergency information is ALWAYS public.
 * - login:  needs an account (personal data, contributions, or business ownership).
 */
export type Access = 'public' | 'login';
export type Availability = 'ready' | 'coming-soon';

export interface Feature {
  id: string;
  icon: string;
  title: MessageKey;
  description: MessageKey;
  href: string;
  access: Access;
  availability: Availability;
}

export const FEATURES: readonly Feature[] = [
  {
    id: 'search',
    icon: 'search',
    title: 'featureSearch',
    description: 'featureSearchDesc',
    href: '/search',
    access: 'public',
    availability: 'ready',
  },
  {
    id: 'emergency',
    icon: 'medkit',
    title: 'featureEmergency',
    description: 'featureEmergencyDesc',
    href: '/category/emergency-contacts',
    access: 'public',
    availability: 'ready',
  },
  {
    id: 'tourism',
    icon: 'camera',
    title: 'featureTourism',
    description: 'featureTourismDesc',
    href: '/category/tourist-places',
    access: 'public',
    availability: 'ready',
  },
  {
    id: 'map',
    icon: 'map',
    title: 'featureMap',
    description: 'featureMapDesc',
    href: '/feature/map',
    access: 'public',
    availability: 'coming-soon',
  },
  {
    id: 'assistant',
    icon: 'chatbubbles',
    title: 'featureAssistant',
    description: 'featureAssistantDesc',
    href: '/feature/assistant',
    access: 'public',
    availability: 'coming-soon',
  },
  {
    id: 'trip',
    icon: 'trail-sign',
    title: 'featureTrip',
    description: 'featureTripDesc',
    href: '/feature/trip',
    access: 'public',
    availability: 'coming-soon',
  },
  {
    id: 'saved',
    icon: 'heart',
    title: 'featureSaved',
    description: 'featureSavedDesc',
    href: '/saved',
    access: 'login',
    availability: 'ready',
  },
  {
    id: 'recent',
    icon: 'time',
    title: 'featureRecent',
    description: 'featureRecentDesc',
    href: '/saved',
    access: 'public',
    availability: 'ready',
  },
  {
    id: 'register',
    icon: 'storefront',
    title: 'featureRegister',
    description: 'featureRegisterDesc',
    href: '/business/new',
    access: 'login',
    availability: 'ready',
  },
  {
    id: 'owner',
    icon: 'stats-chart',
    title: 'featureOwner',
    description: 'featureOwnerDesc',
    href: '/owner',
    access: 'login',
    availability: 'ready',
  },
];

/** Coming-soon detail pages: /feature/[id]. */
export const COMING_SOON_DETAIL: Readonly<Record<string, MessageKey>> = {
  map: 'comingSoonMapDetail',
  assistant: 'comingSoonAssistantDetail',
  trip: 'comingSoonTripDetail',
};

export function getFeature(id: string): Feature | undefined {
  return FEATURES.find((f) => f.id === id);
}
