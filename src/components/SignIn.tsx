"use client";

import { useState } from "react";
import { PhoneAuth, Session, normalizePhone } from "@/domain/auth";

interface SignInProps {
  auth: PhoneAuth;
  onSignedIn: (session: Session) => void;
  onCancel: () => void;
}

// Phone sign-in: a phone number, then a one-time code. No email, ever.
export function SignIn({ auth, onSignedIn, onCancel }: SignInProps) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode() {
    if (normalizePhone(phone) === null) {
      setError("Enter a valid Ghanaian phone number.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await auth.requestCode(phone);
      setStage("code");
    } catch {
      setError("Could not send a code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const session = await auth.verifyCode(phone, code);
      if (session) onSignedIn(session);
      else setError("That code did not work. Check it and try again.");
    } catch {
      setError("Sign-in failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="signin" aria-label="Sign in">
      <h2>Sign in</h2>
      <p className="signin-note">
        Use your phone number. We will send a six-digit code.
      </p>

      <label className="signin-field">
        <span>Phone number</span>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          disabled={stage === "code" || busy}
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>

      {stage === "code" && (
        <label className="signin-field">
          <span>One-time code</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
      )}

      {error && (
        <p className="signin-error" role="alert">
          {error}
        </p>
      )}

      <div className="result-actions">
        {stage === "phone" ? (
          <button
            type="button"
            className="subject-option"
            disabled={busy}
            onClick={requestCode}
          >
            Send code
          </button>
        ) : (
          <button
            type="button"
            className="subject-option"
            disabled={busy}
            onClick={verify}
          >
            Sign in
          </button>
        )}
        <button type="button" className="practice-exit" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}
