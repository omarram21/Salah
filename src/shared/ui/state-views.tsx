import { ActivityIndicator, View } from 'react-native';

import { useThemeColors } from '@/shared/theme/use-theme-colors';

import { Button } from './button';
import { Card } from './card';
import { Icon } from './icon';
import { Text } from './text';

export function LoadingView({ label }: { label: string }) {
  const { c } = useThemeColors();
  return (
    <View className="items-center gap-3 py-16">
      <ActivityIndicator size="large" color={c.ink} />
      <Text variant="caption" tone="muted">{label}</Text>
    </View>
  );
}

type ErrorProps = {
  title: string;
  message: string;
  retryLabel: string;
  onRetry: () => void;
  retrying?: boolean;
};

export function ErrorView({ title, message, retryLabel, onRetry, retrying }: ErrorProps) {
  const { c } = useThemeColors();
  return (
    <Card className="mt-6 items-center gap-3 py-8">
      <Icon name="cloudOff" size={40} color={c.faint} />
      <Text variant="heading" align="center">{title}</Text>
      <Text variant="caption" tone="muted" align="center">{message}</Text>
      <Button label={retryLabel} onPress={onRetry} loading={retrying} className="mt-2 self-stretch" />
    </Card>
  );
}
