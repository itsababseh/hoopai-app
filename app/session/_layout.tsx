import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function SessionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="generate" options={{ presentation: 'modal', gestureEnabled: false }} />
      <Stack.Screen name="active" options={{ gestureEnabled: false }} />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
