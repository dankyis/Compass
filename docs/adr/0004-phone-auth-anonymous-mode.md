# Phone-number authentication with a per-subject free allowance

Students practice anonymously with progress kept on-device, and sign in with a phone number and OTP only when they exhaust the free allowance of 10 questions per subject or want to sync across devices or pay. We chose phone OTP over email because phone ownership is near-universal among Ghanaian students while email is not, and we chose a per-subject free allowance over a single global cap so a student can sample every subject before committing.

**Status**: accepted

## Considered Options

- No accounts at all (simplest, but loses cross-device sync and the paid tier).
- Email plus password (heavier signup, low email adoption among students).
- Phone number plus OTP with a per-subject free allowance (chosen).

## Consequences

- Requires an SMS/OTP provider and carries a per-message cost; OTP requests must be rate-limited against abuse.
- Anonymous progress lives in IndexedDB and must merge into the account on first sign-in (best-per-subject wins) so nothing is lost at the wall.
- The free allowance is measured per subject, not globally.
