import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, View } from 'react-native';

import { Button } from './button';
import { Card } from './card';
import { Text } from './text';

export function LoadingView({ label }: { label: string }) {
  return (
    <View className="items-center gap-3 py-16">
      <ActivityIndicator size="large" />
      <Text variant="muted">{label}</Text>
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
  return (
    <Card className="items-center gap-3 py-8">
      <Ionicons name="cloud-offline-outline" size={40} color="#94A3B8" />
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text variant="muted" align="center">
        {message}
      </Text>
      <Button label={retryLabel} onPress={onRetry} loading={retrying} className="mt-2 self-stretch" />
    </Card>
  );
}
