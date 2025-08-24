import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

// Name must match `Name("LiveActivity")` in the Swift module.
// Lazily resolve to avoid crashing in Expo Go or when a dev client hasn't been rebuilt yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNative(): any | null {
  if (Platform.OS !== 'ios') return null;
  try {
    return requireNativeModule('LiveActivity');
  } catch {
    return null;
  }
}

type Status = { id: string; elapsedTime: number; state: 'active' | 'paused' };

export async function startActivity(activityName: string): Promise<string | null> {
  const Native = getNative();
  if (!Native) return null;
  return Native.startActivity(activityName);
}

export async function updateActivity(elapsedSeconds?: number, isPaused?: boolean): Promise<boolean> {
  const Native = getNative();
  if (!Native) return false;
  return Native.updateActivity(elapsedSeconds, isPaused);
}

export async function pauseActivity(): Promise<boolean> {
  const Native = getNative();
  if (!Native) return false;
  return Native.pauseActivity();
}

export async function resumeActivity(): Promise<boolean> {
  const Native = getNative();
  if (!Native) return false;
  return Native.resumeActivity();
}

export async function endActivity(): Promise<boolean> {
  const Native = getNative();
  if (!Native) return false;
  return Native.endActivity();
}

export async function getStatus(): Promise<Status | null> {
  const Native = getNative();
  if (!Native) return null;
  return Native.getStatus();
}
