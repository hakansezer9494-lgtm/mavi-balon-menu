import { getAppSetting, setAppSetting } from "@/lib/menu-store";
import {
  clampGuestSessionTtlMinutes,
  DEFAULT_GUEST_SESSION_TTL_MINUTES,
} from "@/lib/guest-session-ttl";

const TTL_KEY = "guest_session_ttl_minutes";

export async function getGuestSessionTtlMinutes(): Promise<number> {
  const raw = await getAppSetting(TTL_KEY);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_GUEST_SESSION_TTL_MINUTES;
  return clampGuestSessionTtlMinutes(parsed);
}

export async function setGuestSessionTtlMinutes(minutes: number) {
  const next = clampGuestSessionTtlMinutes(minutes);
  await setAppSetting(TTL_KEY, String(next));
  return next;
}
