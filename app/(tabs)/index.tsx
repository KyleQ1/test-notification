import { StyleSheet, Button, Alert, AppState, View, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const appState = useRef(AppState.currentState);
  const backgroundNotificationId = useRef<string | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const handleAppStateChange = (nextAppState: any) => {
    if (appState.current.match(/active/) && nextAppState === 'background') {
      scheduleBackgroundNotification();
    } else if (nextAppState === 'active' && backgroundNotificationId.current) {
      Notifications.cancelScheduledNotificationAsync(backgroundNotificationId.current);
      backgroundNotificationId.current = null;
    }
    appState.current = nextAppState;
  };

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permission not granted for notifications');
      return;
    }
  };

  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This notification was scheduled 30 seconds ago!",
        data: { testData: 'Hello from notification!' },
      },
      trigger: { seconds: 30 } as any,
    });
    
    Alert.alert('Notification Scheduled', 'You will receive a notification in 30 seconds!');
  };

  const scheduleBackgroundNotification = async () => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Background Notification",
          body: "The app has been in background for 30 seconds!",
          data: { type: 'background' },
        },
        trigger: { seconds: 30 } as any,
      });
      backgroundNotificationId.current = notificationId;
    } catch (error) {
      console.error('Error scheduling background notification:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Manual Notification</Text>
        <Text style={styles.description}>
          Tap to schedule a notification in 30 seconds
        </Text>
        <Button
          title="Schedule Notification (30s)"
          onPress={scheduleNotification}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Background Notification</Text>
        <Text style={styles.description}>
          Put the app in background to trigger a notification after 30 seconds
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
});
