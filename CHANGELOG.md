# Changelog

All notable changes to the **VaultLease** project will be documented in this file.

## [Unreleased]

### Added
- Created `CHANGELOG.md` to track project history.
- Implemented **12-round bcrypt hashing** for password storage.
- Added password complexity enforcement (Uppsercase, lower, number, symbol, min 10 chars).
- Added password history tracking (last 3 passwords cannot be reused).
- Added password expiry policy (90 days).

### Changed
- Rebranded application from **DreamDwell** to **VaultLease**.
- Renamed packages to `vaultlease-backend` and `vaultlease-frontend`.
- Updated all API responses and Email templates to reflect new branding.

### Documentation
- Created `backend/README.md` with API usage instructions.
- Updated `frontend/README.md` with setup guide.
- Added JSDoc annotations to all Auth and Property controllers.
