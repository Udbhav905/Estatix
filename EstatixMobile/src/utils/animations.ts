import { withSpring, withTiming, withSequence, withDelay, interpolate, Extrapolate } from 'react-native-reanimated';

export const springPreset = {
  damping: 12,
  stiffness: 100,
  mass: 1,
};

export const cardEntrance = (index: number) => ({
  entering: withDelay(index * 80, withSpring(1, springPreset)),
  exiting: withTiming(0, { duration: 200 }),
});

export const heartPop = () => withSequence(withSpring(0.8, springPreset), withSpring(1.2, springPreset), withSpring(1, springPreset));

export const fadeInUp = (delay = 0) => ({
  from: { opacity: 0, translateY: 20 },
  to: { opacity: 1, translateY: 0 },
  config: { duration: 400, delay },
});

export const parallaxImage = (scrollY: number, imageHeight: number) => {
  'worklet';
  const translateY = interpolate(scrollY, [0, imageHeight], [0, -imageHeight * 0.3], Extrapolate.CLAMP);
  return { transform: [{ translateY }] };
};