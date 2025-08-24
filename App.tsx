import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as LiveActivity from '@app/live-activity';

export default function App() {
  const [name, setName] = useState('My Activity');
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick every second when running
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    }
    return () => {
      if (timerRef.current != null) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isActive, isPaused]);

  // Keep Live Activity in sync (best-effort)
  useEffect(() => {
    if (Platform.OS === 'ios' && isActive) {
      LiveActivity.updateActivity(elapsed, isPaused).catch(() => {});
    }
  }, [elapsed, isPaused, isActive]);

  const formatted = useMemo(() => {
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(elapsed % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [elapsed]);

  const onStart = async () => {
    if (isActive) return;
    setElapsed(0);
    setIsPaused(false);
    setIsActive(true);
    if (Platform.OS === 'ios') {
      console.log('Starting Live Activity...');
      const activityId = await LiveActivity.startActivity(name);
      console.log('Activity ID:', activityId);
      const updateResult = await LiveActivity.updateActivity(0, false);
      console.log('Update result:', updateResult);
    }
  };

  const onPause = async () => {
    if (!isActive || isPaused) return;
    setIsPaused(true);
    if (Platform.OS === 'ios') await LiveActivity.pauseActivity();
  };

  const onResume = async () => {
    if (!isActive || !isPaused) return;
    setIsPaused(false);
    if (Platform.OS === 'ios') await LiveActivity.resumeActivity();
  };

  const onEnd = async () => {
    if (!isActive) return;
    setIsActive(false);
    setIsPaused(false);
    if (timerRef.current != null) clearInterval(timerRef.current);
    timerRef.current = null;
    if (Platform.OS === 'ios') await LiveActivity.endActivity();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Live Activity Timer</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Activity name"
        />
        <Text style={styles.time}>{formatted}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, isActive && styles.btnDisabled]} onPress={onStart} disabled={isActive}>
            <Text style={styles.btnText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, (!isActive || isPaused) && styles.btnDisabled]} onPress={onPause} disabled={!isActive || isPaused}>
            <Text style={styles.btnText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, (!isActive || !isPaused) && styles.btnDisabled]} onPress={onResume} disabled={!isActive || !isPaused}>
            <Text style={styles.btnText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, !isActive && styles.btnDisabled]} onPress={onEnd} disabled={!isActive}>
            <Text style={styles.btnText}>End</Text>
          </TouchableOpacity>
        </View>
        {Platform.OS === 'ios' ? (
          <Text style={styles.note}>iOS Live Activities enabled (ActivityKit ≥ 16.1)</Text>
        ) : (
          <Text style={styles.note}>Android: Live Activities not available (optional notification support TBD)</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f8' },
  card: { flex: 1, padding: 24, gap: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600' },
  input: { width: '80%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
  time: { fontSize: 36, fontVariant: ['tabular-nums'], marginVertical: 8 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' },
  btn: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#111827', borderRadius: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '600' },
  note: { fontSize: 12, color: '#6b7280' },
});
