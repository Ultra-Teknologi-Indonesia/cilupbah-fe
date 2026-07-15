const KEY = "cilupbah:reset-flow";

export interface ResetFlowState {
  email: string;
  reset_token: string;
  expires_at: string;
}

export function saveResetFlow(state: ResetFlowState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function readResetFlow(): ResetFlowState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResetFlowState;
    if (!parsed?.reset_token || !parsed?.email) return null;
    if (parsed.expires_at && new Date(parsed.expires_at).getTime() < Date.now()) {
      clearResetFlow();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearResetFlow(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
