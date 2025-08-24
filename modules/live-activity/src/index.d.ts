export type Status = { id: string; elapsedTime: number; state: 'active' | 'paused' };
export function startActivity(activityName: string): Promise<string | null>;
export function updateActivity(elapsedSeconds?: number, isPaused?: boolean): Promise<boolean>;
export function pauseActivity(): Promise<boolean>;
export function resumeActivity(): Promise<boolean>;
export function endActivity(): Promise<boolean>;
export function getStatus(): Promise<Status | null>;
