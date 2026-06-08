'use client';

import { useEffect, useRef, useState } from 'react';

export function useReelPlayback() {
  const [playTime, setPlayTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let animationFrameId = 0;
    let lastTime = Date.now();

    const tick = () => {
      if (isPlaying) {
        const now = Date.now();
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        setPlayTime((prev) => (prev + delta >= 15 ? 0 : prev + delta));
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      lastTime = Date.now();
    }

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  return {
    playTime,
    isPlaying,
    setPlayTime,
    setIsPlaying,
    togglePlay: () => setIsPlaying((value) => !value),
    reset: () => setPlayTime(0),
  };
}

export function useReelSynth(isPlaying: boolean, volume: number, tempo: number) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stop = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (!isPlaying || volume <= 0) {
      stop();
      return stop;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      let index = 0;
      const interval = 60 / tempo / 2;

      const playStep = () => {
        if (!audioCtxRef.current) return;
        const time = ctx.currentTime;

        if (index % 4 === 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(120, time);
          osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);
          gain.gain.setValueAtTime(volume * 0.35, time);
          gain.gain.linearRampToValueAtTime(0.01, time + 0.12);
          osc.start(time);
          osc.stop(time + 0.12);
        }

        index += 1;
        timerRef.current = setTimeout(playStep, interval * 1000);
      };

      stop();
      playStep();
    } catch {
      // Audio blocked or unsupported — preview still works without sound.
    }

    return stop;
  }, [isPlaying, volume, tempo]);
}
