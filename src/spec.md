# Specification

## Summary
**Goal:** Make IEMS publish-ready as an installable PWA and add in-app sharing/install guidance.

**Planned changes:**
- Add PWA support: web app manifest linked from the HTML head, required app icons, and a basic offline fallback page/message for the app shell.
- Add an in-app “App info” area in the main layout that displays the current deployed URL (from `window.location`) and provides a “Copy link” action with success feedback.
- Add an English install help panel explaining the app is web-based (no APK) with device-appropriate install instructions, including an “Install” action when supported and manual steps otherwise.

**User-visible outcome:** Users can install IEMS from the browser to their home screen, see a friendly offline message after first load when offline, copy/share the app’s URL from within the UI, and read clear English instructions for installing/adding a shortcut.
