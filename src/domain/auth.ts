// Phone authentication seam.
// Sign-in is a phone number plus a one-time code, never email (ADR-0004).
// The provider is pluggable: tests and offline builds use the dev provider
// here, and a Supabase-backed provider can slot in behind the same interface.

export interface Session {
  phone: string;
}

export interface PhoneAuth {
  /** Ask the provider to text a one-time code to `phone`. */
  requestCode(phone: string): Promise<void>;
  /** Exchange a phone number and code for a Session, or null when rejected. */
  verifyCode(phone: string, code: string): Promise<Session | null>;
  /** End the session on the device. */
  signOut(): Promise<void>;
}

/**
 * Normalize a Ghanaian phone number to E.164 (+233XXXXXXXXX).
 * Accepts 0XXXXXXXXX, 233XXXXXXXXX and +233XXXXXXXXX; null when it does not fit.
 */
export function normalizePhone(value: string): string | null {
  let local = value.replace(/[^\d+]/g, "");
  if (local.startsWith("+233")) local = local.slice(4);
  else if (local.startsWith("233") && local.length === 12) local = local.slice(3);
  else if (local.startsWith("0")) local = local.slice(1);
  if (!/^\d{9}$/.test(local)) return null;
  return `+233${local}`;
}

/** A one-time code is exactly six digits. */
export function isValidCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

/**
 * Development provider: no SMS is sent and any six-digit code is accepted.
 * It exists so the sign-in flow and progress merge are exercised end to end
 * before the Supabase provider is wired in.
 */
export function createDevPhoneAuth(): PhoneAuth {
  return {
    async requestCode() {
      // No-op: a real provider would text a code here.
    },
    async verifyCode(phone, code) {
      const normalized = normalizePhone(phone);
      if (!normalized || !isValidCode(code)) return null;
      return { phone: normalized };
    },
    async signOut() {
      // Nothing to release for the dev provider.
    },
  };
}
