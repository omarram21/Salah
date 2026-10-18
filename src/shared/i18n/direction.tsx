import { createContext, useContext, type ReactNode } from 'react';

export type Direction = 'ltr' | 'rtl';

const DirectionContext = createContext<Direction>('ltr');

/**
 * Layout direction for the app. We apply it with the `direction` style (and expo-router's
 * LocaleProvider) instead of I18nManager.forceRTL, so switching language takes effect
 * immediately, with no reload, and also works in Expo Go.
 */
export function DirectionProvider({ direction, children }: { direction: Direction; children: ReactNode }) {
  return <DirectionContext.Provider value={direction}>{children}</DirectionContext.Provider>;
}

export function useDirection() {
  const direction = useContext(DirectionContext);
  return { direction, isRTL: direction === 'rtl' };
}
