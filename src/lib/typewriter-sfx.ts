/**
 * Typewriter click SFX — tiny Web Audio synth.
 *
 * Plays a ~40ms filtered-noise burst per key press, shaped to read as
 * an old mechanical keyboard click rather than a 1980s beep. Synthesis
 * beats shipping a sound file: no license to audit, one AudioContext
 * shared across the whole page, and we can vary pitch / gain per call
 * so the loop doesn't sound mechanical.
 *
 * Because browser autoplay policies suspend a fresh AudioContext until
 * a user gesture, `ensureTypewriterAudio()` installs a single
 * `pointerdown` listener that resumes the context on the first
 * interaction; before that, `playTypewriterClick()` is a no-op.
 */

let ctx: AudioContext | null = null;
let gestureHooked = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  } catch {
    return null;
  }
  return ctx;
}

/** Call once on mount to prime the audio graph and hook the first-
 *  gesture unlock. Safe to call multiple times — idempotent. */
export function ensureTypewriterAudio(): void {
  if (typeof window === "undefined" || gestureHooked) return;
  const c = getContext();
  if (!c) return;
  gestureHooked = true;
  const unlock = () => {
    if (c.state === "suspended") c.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock, { passive: true });
}

/** Play a single key-click burst. Silent if the AudioContext hasn't
 *  been unlocked yet (happens automatically on the first user gesture
 *  via `ensureTypewriterAudio`). */
export function playTypewriterClick(options?: { volume?: number }): void {
  const c = getContext();
  if (!c || c.state !== "running") return;
  const volume = options?.volume ?? 0.11;
  const now = c.currentTime;

  // Short filtered-noise burst → reads as a key impact.
  const DURATION = 0.045;
  const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * DURATION)), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const envelope = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * envelope;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1700 + Math.random() * 900;
  filter.Q.value = 0.7;

  const gain = c.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + DURATION);

  source.connect(filter).connect(gain).connect(c.destination);
  source.start(now);
  source.stop(now + DURATION + 0.02);
}
