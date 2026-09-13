/** Cross-tab / background-friendly order alerts with selectable chimes. */
import { tableDisplayName } from "@/lib/table-qr";

export type OrderAlertSoundId =
  | "classic"
  | "soft"
  | "kitchen"
  | "urgent"
  | "bright"
  | "tenten"
  | "yarabbi"
  | "kardesim";

export type OrderAlertSoundOption = {
  id: OrderAlertSoundId;
  label: string;
  description: string;
};

type Tone = {
  freq: number;
  type: OscillatorType;
  at: number;
  dur: number;
  peak: number;
};

type WavTone = { freq: number; start: number; dur: number; gain?: number };

const SOUND_KEY = "mavi-order-alert-sound";
const TITLE_BASE_KEY = "mavi-order-title-base";

export const ORDER_ALERT_SOUNDS: OrderAlertSoundOption[] = [
  {
    id: "classic",
    label: "Klasik",
    description: "Net yükselen dört ton — varsayılan mutfak zili.",
  },
  {
    id: "soft",
    label: "Yumuşak",
    description: "Daha sakin, düşük frekanslı yumuşak uyarı.",
  },
  {
    id: "kitchen",
    label: "Mutfak zili",
    description: "Kısa çift ding — hızlı fark edilir.",
  },
  {
    id: "urgent",
    label: "Acil",
    description: "Keskin ve tekrarlı — yoğun saatler için.",
  },
  {
    id: "bright",
    label: "Parlak",
    description: "Parlak üçlü melodi — ferah bildirim.",
  },
  {
    id: "tenten",
    label: "Tenten",
    description: "Sesli: “Tenten!” diye bağırır.",
  },
  {
    id: "yarabbi",
    label: "Yarabbi şükür",
    description: "Sesli: “Yarabbi şükür!” diye söyler.",
  },
  {
    id: "kardesim",
    label: "Kardeşim sağolsun",
    description: "Sesli: “Kardeşim sağolsun!” diye söyler.",
  },
];

const VOICE_PHRASES: Partial<Record<OrderAlertSoundId, string>> = {
  tenten: "Tenten!",
  yarabbi: "Yarabbi şükür!",
  kardesim: "Kardeşim sağolsun!",
};

const WEB_PATTERNS: Partial<Record<OrderAlertSoundId, Tone[]>> = {
  classic: [
    { freq: 660, type: "square", at: 0, dur: 0.22, peak: 0.42 },
    { freq: 880, type: "sawtooth", at: 0.12, dur: 0.28, peak: 0.48 },
    { freq: 1175, type: "square", at: 0.26, dur: 0.34, peak: 0.52 },
    { freq: 1568, type: "triangle", at: 0.42, dur: 0.42, peak: 0.4 },
  ],
  soft: [
    { freq: 523, type: "sine", at: 0, dur: 0.35, peak: 0.28 },
    { freq: 659, type: "triangle", at: 0.2, dur: 0.4, peak: 0.26 },
    { freq: 784, type: "sine", at: 0.42, dur: 0.45, peak: 0.22 },
  ],
  kitchen: [
    { freq: 1320, type: "square", at: 0, dur: 0.12, peak: 0.5 },
    { freq: 1760, type: "square", at: 0.14, dur: 0.14, peak: 0.46 },
    { freq: 1320, type: "triangle", at: 0.32, dur: 0.18, peak: 0.34 },
  ],
  urgent: [
    { freq: 880, type: "sawtooth", at: 0, dur: 0.12, peak: 0.5 },
    { freq: 880, type: "sawtooth", at: 0.16, dur: 0.12, peak: 0.5 },
    { freq: 988, type: "square", at: 0.32, dur: 0.14, peak: 0.52 },
    { freq: 1175, type: "square", at: 0.5, dur: 0.22, peak: 0.48 },
  ],
  bright: [
    { freq: 784, type: "triangle", at: 0, dur: 0.16, peak: 0.36 },
    { freq: 988, type: "sine", at: 0.12, dur: 0.16, peak: 0.34 },
    { freq: 1319, type: "triangle", at: 0.24, dur: 0.22, peak: 0.38 },
    { freq: 1568, type: "sine", at: 0.42, dur: 0.32, peak: 0.3 },
  ],
};

const WAV_PATTERNS: Partial<
  Record<OrderAlertSoundId, { tones: WavTone[]; totalSec: number }>
> = {
  classic: {
    totalSec: 0.7,
    tones: [
      { freq: 880, start: 0, dur: 0.18 },
      { freq: 1175, start: 0.16, dur: 0.2 },
      { freq: 1568, start: 0.34, dur: 0.28 },
    ],
  },
  soft: {
    totalSec: 0.9,
    tones: [
      { freq: 523, start: 0, dur: 0.28, gain: 0.4 },
      { freq: 659, start: 0.22, dur: 0.32, gain: 0.35 },
      { freq: 784, start: 0.48, dur: 0.35, gain: 0.3 },
    ],
  },
  kitchen: {
    totalSec: 0.55,
    tones: [
      { freq: 1320, start: 0, dur: 0.12, gain: 0.6 },
      { freq: 1760, start: 0.14, dur: 0.14, gain: 0.55 },
      { freq: 1320, start: 0.32, dur: 0.16, gain: 0.4 },
    ],
  },
  urgent: {
    totalSec: 0.8,
    tones: [
      { freq: 880, start: 0, dur: 0.1, gain: 0.6 },
      { freq: 880, start: 0.16, dur: 0.1, gain: 0.6 },
      { freq: 988, start: 0.32, dur: 0.12, gain: 0.62 },
      { freq: 1175, start: 0.5, dur: 0.2, gain: 0.55 },
    ],
  },
  bright: {
    totalSec: 0.75,
    tones: [
      { freq: 784, start: 0, dur: 0.14, gain: 0.45 },
      { freq: 988, start: 0.12, dur: 0.14, gain: 0.42 },
      { freq: 1319, start: 0.24, dur: 0.18, gain: 0.48 },
      { freq: 1568, start: 0.42, dur: 0.26, gain: 0.4 },
    ],
  },
};

let audioCtx: AudioContext | null = null;
let unlocked = false;
let titleTimer: number | null = null;
let chimeAudio: HTMLAudioElement | null = null;
let chimeSoundId: OrderAlertSoundId | null = null;
let voicesReady = false;

function isSoundId(value: string | null): value is OrderAlertSoundId {
  return ORDER_ALERT_SOUNDS.some((sound) => sound.id === value);
}

function isVoiceSound(id: OrderAlertSoundId) {
  return Boolean(VOICE_PHRASES[id]);
}

export function getOrderAlertSoundId(): OrderAlertSoundId {
  if (typeof window === "undefined") return "classic";
  const saved = window.localStorage.getItem(SOUND_KEY);
  return isSoundId(saved) ? saved : "classic";
}

export function setOrderAlertSoundId(id: OrderAlertSoundId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOUND_KEY, id);
  // Force HTML audio element rebuild on next play.
  chimeAudio = null;
  chimeSoundId = null;
}

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

function ensureVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const load = () => {
    voicesReady = window.speechSynthesis.getVoices().length > 0;
  };
  load();
  if (!voicesReady) {
    window.speechSynthesis.addEventListener("voiceschanged", load, {
      once: true,
    });
  }
}

function pickTurkishVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("tr")) ??
    voices.find((v) => /turkish|türk/i.test(v.name)) ??
    voices.find((v) => v.default) ??
    voices[0] ??
    null
  );
}

function speakPhrase(phrase: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  ensureVoices();
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(phrase);
  utter.lang = "tr-TR";
  utter.rate = 1.05;
  utter.pitch = 1.05;
  utter.volume = 1;
  const voice = pickTurkishVoice();
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

function buildWavDataUri(id: OrderAlertSoundId) {
  const sampleRate = 22050;
  const pattern = WAV_PATTERNS[id];
  if (!pattern) return "";
  const samples = Math.floor(sampleRate * pattern.totalSec);
  const data = new Int16Array(samples);
  for (const tone of pattern.tones) {
    const start = Math.floor(tone.start * sampleRate);
    const len = Math.floor(tone.dur * sampleRate);
    const gain = tone.gain ?? 0.55;
    for (let i = 0; i < len; i++) {
      const idx = start + i;
      if (idx >= samples) break;
      const t = i / sampleRate;
      const env = Math.min(1, i / 200) * Math.min(1, (len - i) / 400);
      const sample = Math.sin(2 * Math.PI * tone.freq * t) * env * gain;
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
}

function getHtmlChime(id: OrderAlertSoundId) {
  if (isVoiceSound(id)) return null;
  if (!chimeAudio || chimeSoundId !== id) {
    const uri = buildWavDataUri(id);
    if (!uri) return null;
    chimeAudio = new Audio(uri);
    chimeAudio.preload = "auto";
    chimeAudio.volume = 1;
    chimeSoundId = id;
  }
  return chimeAudio;
}

/** Call from a user gesture so browsers allow later background playback. */
export function unlockOrderAlerts() {
  if (typeof window === "undefined") return;
  unlocked = true;
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume();
  }
  ensureVoices();
  if (window.speechSynthesis) {
    // Nudge speech engine on user gesture (required on some browsers).
    window.speechSynthesis.cancel();
  }
  const soundId = getOrderAlertSoundId();
  if (!isVoiceSound(soundId)) {
    const audio = getHtmlChime(soundId);
    if (audio) {
      audio.muted = true;
      void audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        })
        .catch(() => {
          audio.muted = false;
        });
    }
  }

  if ("Notification" in window && Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

export function ensureNotificationPermission(): Promise<NotificationPermission | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve(null);
  }
  if (Notification.permission === "default") {
    return Notification.requestPermission();
  }
  return Promise.resolve(Notification.permission);
}

function playWebAudioChime(id: OrderAlertSoundId) {
  const tones = WEB_PATTERNS[id];
  if (!tones) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);

  for (const tone of tones) {
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

function playHtmlAudioChime(id: OrderAlertSoundId) {
  const audio = getHtmlChime(id);
  if (!audio) return;
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // ignore autoplay blocks; Notification still fires when hidden
  });
}

function playAlertSound(id: OrderAlertSoundId) {
  const phrase = VOICE_PHRASES[id];
  if (phrase) {
    speakPhrase(phrase);
    return;
  }
  playWebAudioChime(id);
  playHtmlAudioChime(id);
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

export function previewOrderAlertSound(id?: OrderAlertSoundId) {
  const soundId = id ?? getOrderAlertSoundId();
  unlockOrderAlerts();
  playAlertSound(soundId);
}


function playForgottenAlertSound() {
  // Distinct from new-order chime: three sharp rising bursts.
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    void ctx.resume();
    const now = ctx.currentTime;
    const bursts = [
      [0, 720],
      [0.28, 880],
      [0.56, 1100],
      [0.9, 1320],
    ] as const;
    for (const [at, freq] of bursts) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      const start = now + at;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.55, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.24);
    }
    window.setTimeout(() => {
      void ctx.close();
    }, 1600);
  } catch {
    // fall back to urgent voice if available
    playAlertSound("urgent");
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance("Sipariş unutuldu!");
      utter.lang = "tr-TR";
      utter.rate = 1.05;
      utter.volume = 1;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore
    }
  }
}

export function announceForgottenOrder(detail?: {
  tableNumber?: string;
  customerName?: string;
  totalLabel?: string;
}) {
  if (!unlocked) {
    unlocked = true;
  }

  playForgottenAlertSound();

  const table = detail?.tableNumber
    ? detail.customerName
      ? `${tableDisplayName(detail.tableNumber)} · ${detail.customerName}`
      : tableDisplayName(detail.tableNumber)
    : "Unutulan sipariş";
  const body = detail?.totalLabel
    ? `${table} · ${detail.totalLabel}`
    : table;

  flashDocumentTitle("⚠️ Unutulan sipariş!");

  if (typeof document !== "undefined" && document.hidden) {
    showDesktopNotification("Unutulan sipariş", body);
  }
}

export function announceNewOrder(detail?: {
  tableNumber?: string;
  customerName?: string;
  totalLabel?: string;
}) {
  if (!unlocked) {
    unlocked = true;
  }

  const soundId = getOrderAlertSoundId();
  playAlertSound(soundId);

  const table = detail?.tableNumber
    ? detail.customerName
      ? `${tableDisplayName(detail.tableNumber)} · ${detail.customerName}`
      : tableDisplayName(detail.tableNumber)
    : "Yeni sipariş";
  const body = detail?.totalLabel
    ? `${table} · ${detail.totalLabel}`
    : table;

  flashDocumentTitle("🔔 Yeni sipariş!");

  if (typeof document !== "undefined" && document.hidden) {
    showDesktopNotification("Yeni sipariş", body);
  }
}
