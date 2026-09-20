# Offline-capable PWA as the primary platform

We build an installable, offline-capable Progressive Web App targeting Android and mobile web, with no native iOS app. Data is cheap in Ghana (~US$0.40/GB) but roughly a quarter of users are offline, so the app must work without connectivity. iOS is excluded for now because its PWA support is weak and native cost is high.

**Status**: accepted

## Consequences

- No iOS App Store presence; iOS users are served by the web app only.
- Offline-first constrains ads (rewarded ads can only show when online) and requires on-device storage of the question bank and progress.
- A native Android wrapper may be added later if retention justifies it.
