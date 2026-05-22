import type { createClient } from "@/lib/supabase/client";
import type { UserPresence } from "@/lib/types/database";

type SupabaseClient = ReturnType<typeof createClient>;

const RECENT_ACTIVITY_MS = 60 * 60 * 1000;
const WEEK_ACTIVITY_MS = 7 * 24 * 60 * 60 * 1000;

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  );
}

export function formatLastActivityLabel(lastSeenAt: string | null, now: Date = new Date()) {
  if (!lastSeenAt) return null;

  const lastSeenDate = new Date(lastSeenAt);
  const lastSeenTime = lastSeenDate.getTime();
  if (Number.isNaN(lastSeenTime)) return null;

  const elapsedMs = Math.max(0, now.getTime() - lastSeenTime);
  if (elapsedMs < RECENT_ACTIVITY_MS) return "Derniere activite recemment";
  if (isSameLocalDay(lastSeenDate, now)) return "Derniere activite aujourd'hui";
  if (elapsedMs <= WEEK_ACTIVITY_MS) return "Derniere activite cette semaine";

  return "Derniere activite il y a plus d'une semaine";
}

export async function writePresenceHeartbeat(supabase: SupabaseClient, userId: string, now: Date = new Date()) {
  const timestamp = now.toISOString();

  return supabase
    .from("user_presence")
    .upsert({
      user_id: userId,
      last_seen_at: timestamp,
      last_heartbeat_at: timestamp,
    }, { onConflict: "user_id" });
}

export async function fetchUserPresence(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_presence")
    .select("user_id,last_seen_at,last_heartbeat_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;

  return data as UserPresence | null;
}
