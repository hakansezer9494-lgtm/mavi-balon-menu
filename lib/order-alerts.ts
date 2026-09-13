/** Cross-tab / background-friendly order alerts. */

const TITLE_BASE_KEY = "mavi-order-title-base";
let audioCtx: AudioContext | null = null;
let unlocked = false;
let titleTimer: number | null = null;
let chimeAudio: HTMLAudioElement | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  audioCtx = new Ctx();
  return audioCtx;
}

/** Call from a user gesture so browsers allow later background playback. */
export function unlockOrderAlerts() {
  if (typeof window === "undefined") return;
  unlocked = true;
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume();
  }
  if (!chimeAudio) {
    chimeAudio = new Audio(ORDER_CHIME_DATA_URI);
    chimeAudio.preload = "auto";
    chimeAudio.volume = 1;
  }
  // Prime the element with a muted play/pause cycle.
  chimeAudio.muted = true;
  void chimeAudio
    .play()
    .then(() => {
      chimeAudio?.pause();
      if (chimeAudio) {
        chimeAudio.currentTime = 0;
        chimeAudio.muted = false;
      }
    })
    .catch(() => {
      if (chimeAudio) chimeAudio.muted = false;
    });

  if (
    "Notification" in window &&
    Notification.permission === "default"
  ) {
    void Notification.requestPermission();
  }
}

export function ensureNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

function playWebAudioChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);

  const pattern: Array<{
    freq: number;
    type: OscillatorType;
    at: number;
    dur: number;
    peak: number;
  }> = [
    { freq: 660, type: "square", at: 0, dur: 0.22, peak: 0.42 },
    { freq: 880, type: "sawtooth", at: 0.12, dur: 0.28, peak: 0.48 },
    { freq: 1175, type: "square", at: 0.26, dur: 0.34, peak: 0.52 },
    { freq: 1568, type: "triangle", at: 0.42, dur: 0.42, peak: 0.4 },
  ];

  for (const tone of pattern) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone.type;
    osc.frequency.value = tone.freq;
    const start = now + tone.at;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(tone.peak, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + tone.dur + 0.02);
  }
}

function playHtmlAudioChime() {
  if (!chimeAudio) {
    chimeAudio = new Audio(ORDER_CHIME_DATA_URI);
    chimeAudio.volume = 1;
  }
  chimeAudio.currentTime = 0;
  void chimeAudio.play().catch(() => {
    // ignore autoplay blocks; Notification still fires when hidden
  });
}

function flashDocumentTitle(message: string) {
  if (typeof document === "undefined") return;
  if (!sessionStorage.getItem(TITLE_BASE_KEY)) {
    sessionStorage.setItem(TITLE_BASE_KEY, document.title);
  }
  const base = sessionStorage.getItem(TITLE_BASE_KEY) || document.title;
  let tick = 0;
  if (titleTimer) window.clearInterval(titleTimer);
  document.title = message;
  titleTimer = window.setInterval(() => {
    tick += 1;
    document.title = tick % 2 === 0 ? message : base;
    if (tick >= 10) {
      if (titleTimer) window.clearInterval(titleTimer);
      titleTimer = null;
      document.title = base;
    }
  }, 900);
}

function showDesktopNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const notification = new Notification(title, {
      body,
      tag: "mavi-new-order",
      silent: false,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    // ignore
  }
}

export function announceNewOrder(detail?: {
  tableNumber?: string;
  totalLabel?: string;
}) {
  if (!unlocked) {
    // Still try — may work if browser already allowed audio.
    unlocked = true;
  }

  playWebAudioChime();
  playHtmlAudioChime();

  const table = detail?.tableNumber ? `Masa ${detail.tableNumber}` : "Yeni sipariş";
  const body = detail?.totalLabel
    ? `${table} · ${detail.totalLabel}`
    : table;

  flashDocumentTitle("🔔 Yeni sipariş!");

  if (typeof document !== "undefined" && document.hidden) {
    showDesktopNotification("Yeni sipariş", body);
  }
}

/** Short multi-beep WAV (mono 16-bit) as data URI — works with HTMLAudio in background tabs. */
const ORDER_CHIME_DATA_URI = (() => {
  const sampleRate = 22050;
  const tones = [
    { freq: 880, start: 0, dur: 0.18 },
    { freq: 1175, start: 0.16, dur: 0.2 },
    { freq: 1568, start: 0.34, dur: 0.28 },
  ];
  const totalSec = 0.7;
  const samples = Math.floor(sampleRate * totalSec);
  const data = new Int16Array(samples);
  for (const tone of tones) {
    const start = Math.floor(tone.start * sampleRate);
    const len = Math.floor(tone.dur * sampleRate);
    for (let i = 0; i < len; i++) {
      const idx = start + i;
      if (idx >= samples) break;
      const t = i / sampleRate;
      const env = Math.min(1, i / 200) * Math.min(1, (len - i) / 400);
      const sample = Math.sin(2 * Math.PI * tone.freq * t) * env * 0.55;
      data[idx] = Math.max(
        -32767,
        Math.min(32767, data[idx] + Math.floor(sample * 32767))
      );
    }
  }
  const buffer = new ArrayBuffer(44 + data.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + data.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) {
    view.setInt16(44 + i * 2, data[i], true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(binary)}`;
})();
