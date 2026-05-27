import * as Haptics from 'expo-haptics';

type NotificationType = 'success' | 'error' | 'warning';

export const useHaptic = () => {
  const impact = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
  ) => {
    Haptics.impactAsync(style);
  };

  const notification = (type: NotificationType = 'success') => {
    const map = {
      success: Haptics.NotificationFeedbackType.Success,
      error: Haptics.NotificationFeedbackType.Error,
      warning: Haptics.NotificationFeedbackType.Warning,
    };

    Haptics.notificationAsync(map[type]);
  };

  return { impact, notification };
};