import Constants, { ExecutionEnvironment } from 'expo-constants';
import { reloadAppAsync } from 'expo';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { I18nManager, Platform } from 'react-native';

export type Direction = 'ltr' | 'rtl';

const DirectionContext = createContext<Direction>('ltr');

// Our styles pick physical left/right themselves (see Text, Input), so RN must not swap them again.
I18nManager.swapLeftAndRightInRTL(false);

/**
 * Layout direction for the app. Applied with the `direction` style (and expo-router's
 * LocaleProvider) so a language switch shows at once and works in Expo Go, and also with
 * I18nManager (see `useNativeDirection`) so native views mirror too in the built app.
 */
export function DirectionProvider({ direction, children }: { direction: Direction; children: ReactNode }) {
  return <DirectionContext.Provider value={direction}>{children}</DirectionContext.Provider>;
}

export function useDirection() {
  const direction = useContext(DirectionContext);
  return { direction, isRTL: direction === 'rtl' };
}

/**
 * Makes the native layout direction match the app language. It only takes effect after a
 * restart, so the app reloads once when they differ. Skipped in Expo Go, which resets it.
 */
export function useNativeDirection(direction: Direction) {
  useEffect(() => {
    const rtl = direction === 'rtl';
    if (Platform.OS === 'web' || I18nManager.isRTL === rtl) return;
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return;
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    void reloadAppAsync('Layout direction changed');
  }, [direction]);
}
