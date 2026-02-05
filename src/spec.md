# Specification

## Summary
**Goal:** Add secure secret-link sharing for notes with view-once or timed expiry, using client-side encryption and a dedicated encrypted receiver view.

**Planned changes:**
- Add a gold “Share” icon button to the top-right of the existing note view/edit overlay; hide/disable it when no existing note is open.
- Add a share options pop-up with exactly: “View Once” and “Timed Expiry” (with “1 hour” and “24 hours” choices) that generates a secret link for the current note and copies it to clipboard (with fallback UI if copy fails).
- Implement client-side encryption for shared notes so only ciphertext (plus non-secret params like IV) is stored in backend share storage, while the decryption key is placed only in the URL hash fragment and removed from the address bar after extraction.
- Add backend share-link storage and APIs to create share records (ciphertext + metadata) and open/consume them while enforcing expiry and view-once deletion; allow unauthenticated open that returns encrypted data only.
- Add a receiver route/page (“CypherSafe Secure View”) in a Gold & Black theme that fetches encrypted payload by shareId, decrypts with the URL-hash key, displays the note read-only, shows the warning text, and displays clear English errors for expired/invalid/consumed links.
- Add visual success feedback after successful clipboard copy, including an animation and the exact message: “Secret Link Copied to Clipboard!”.

**User-visible outcome:** Users can generate a secure secret link for an existing note (view-once or expiring in 1 hour/24 hours), share it, and recipients can open a dedicated “CypherSafe Secure View” page to read the decrypted note without logging in, with enforced expiry/view-once behavior.
