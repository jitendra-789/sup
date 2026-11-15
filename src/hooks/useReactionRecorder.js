import { useCallback, useEffect, useRef, useState } from 'react';
import { chooseMimeType, recordingExtension } from '../lib/recording';

async function uploadReaction(blob) {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const filename = `reaction-${Date.now()}-${crypto.randomUUID()}.${recordingExtension(blob.type)}`;
    await client.storage.from('reaction-videos').upload(filename, blob, { contentType: blob.type.split(';')[0], upsert: false });
  } catch { /* Optional delivery must never interrupt her experience. */ }
}

export function useReactionRecorder() {
  const [status, setStatus] = useState('idle');
  const [blob, setBlob] = useState(null);
  const stream = useRef(null);
  const recorder = useRef(null);
  const mounted = useRef(true);
  const requestId = useRef(0);
  const stopTimer = useRef(null);
  const safetyTimer = useRef(null);
  const consent = useRef(false);
  const deliveryRequested = useRef(false);
  const savedBlob = useRef(null);

  const release = useCallback(() => {
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
  }, []);

  const request = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setStatus('unavailable'); return false; }
    const id = ++requestId.current;
    setStatus('requesting');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: { echoCancellation: true, noiseSuppression: true } });
      if (!mounted.current || id !== requestId.current) { media.getTracks().forEach(track => track.stop()); return false; }
      stream.current = media;
      consent.current = true;
      setStatus('ready');
      return true;
    } catch { if (mounted.current && id === requestId.current) setStatus('unavailable'); return false; }
  }, []);

  const start = useCallback(() => {
    if (!stream.current || recorder.current) return;
    try {
      const mimeType = chooseMimeType(window.MediaRecorder);
      const instance = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
      const chunks = [];
      recorder.current = instance;
      instance.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      instance.onstop = () => {
        clearTimeout(safetyTimer.current);
        const video = new Blob(chunks, { type: instance.mimeType || chunks[0]?.type || 'video/webm' });
        release();
        if (mounted.current && consent.current) {
          setStatus(video.size ? 'done' : 'unavailable');
          if (video.size) {
            savedBlob.current = video;
            setBlob(video);
            if (deliveryRequested.current) void uploadReaction(video);
          }
        }
      };
      instance.onerror = () => { release(); if (mounted.current) setStatus('unavailable'); };
      instance.start(1000);
      setStatus('recording');
      // Avoid an indefinite recording if the page is left open at the question.
      safetyTimer.current = setTimeout(() => { if (instance.state !== 'inactive') instance.stop(); }, 180000);
    } catch { release(); setStatus('unavailable'); }
  }, [release]);

  const finish = useCallback(() => {
    if (deliveryRequested.current) return;
    deliveryRequested.current = true;
    if (savedBlob.current && consent.current) void uploadReaction(savedBlob.current);
    stopTimer.current = setTimeout(() => {
      if (recorder.current?.state === 'recording') recorder.current.stop();
      else release();
    }, 2500);
  }, [release]);

  const skip = useCallback(() => {
    requestId.current++;
    consent.current = false;
    deliveryRequested.current = false;
    clearTimeout(stopTimer.current);
    clearTimeout(safetyTimer.current);
    if (recorder.current?.state === 'recording') recorder.current.stop();
    savedBlob.current = null;
    setBlob(null);
    release();
    setStatus('skipped');
  }, [release]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestId.current++;
      clearTimeout(stopTimer.current);
      clearTimeout(safetyTimer.current);
      if (recorder.current?.state === 'recording') recorder.current.stop();
      release();
    };
  }, [release]);

  return { status, blob, request, start, finish, skip };
}
