import type { ReactNode } from 'react';
import { View } from 'react-native';

/** Soft grouped surface (E "well"). */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-[22px] bg-well p-4 dark:bg-well-dark ${className}`}>{children}</View>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <View className="px-2 pb-1.5 pt-5">{children}</View>;
}
