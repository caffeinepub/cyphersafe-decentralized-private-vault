# Specification

## Summary
**Goal:** Add a secure recovery system with a 12-word mnemonic phrase and Master QR Code for vault restoration.

**Planned changes:**
- Generate a 12-word BIP39 mnemonic phrase and corresponding Master QR Code during first-time setup after profile creation
- Design a premium Black & Gold "Vault Card" displaying the 12-word phrase, QR code, and security message: "Your Master Key to the Fortress. Keep it offline. Keep it secret."
- Show a security warning dialog before revealing the master key: "This is the only way to recover your data. If lost, even I cannot open your vault."
- Add "Scan to Sync" option on the login screen for vault restoration via QR scan or manual 12-word phrase entry
- Implement export functionality to save the Master Key as a password-protected PDF or high-resolution printable image
- Store the 12-word phrase securely in the backend linked to the user's Principal for recovery verification
- Integrate the master key display into the onboarding flow after ProfileSetup, before showing the main vault interface

**User-visible outcome:** Users receive a 12-word recovery phrase and Master QR Code during setup, can export it as a PDF or printable image, and can restore their vault on new devices by scanning the QR code or entering the 12 words on the login screen.
