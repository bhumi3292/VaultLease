# VaultLease Security Documentation

## 1. Authentication & Session Management
- **Strong Password Policy**: Passwords must be at least 10 characters and include uppercase, lowercase, numbers, and symbols.
- **Password History**: Prevents reuse of the last 5 passwords.
- **MFA (Multi-Factor Authentication)**: Conditional MFA via Email OTP for high-privileged accounts or opt-in.
- **Secure Sessions**: Token-based authentication using HTTP-only, Secure, and SameSite=Strict cookies to mitigate XSS and CSRF.
- **Account Lockout**: Automated 15-minute lockout after 5 failed login attempts to prevent brute-force attacks.

## 2. Authorization & RBAC
- **Role-Based Access Control**: Strict separation between `ADMIN`, `ADMINISTRATOR`, and `REQUESTER`.
- **Ownership Verification**: Middleware ensures administrators can only manage assets and requests within their own department.

## 3. Data Protection
- **Encryption at Rest**: Sensitive fields (e.g., phone numbers, borrow request notes) are encrypted using AES-256-GCM.
- **In-Transit Security**: All API communication is designed for HTTPS.

## 4. Abuse Prevention
- **Rate Limiting**: Public endpoints (Login, OTP, Password Reset) are protected by rate limiters (e.g., 10 attempts per 15 mins).
- **Audit Logging**: Every sensitive action (Login, Create Asset, Approve Request) is recorded in a tamper-evident audit trail with IP address and timestamps.

## 5. Known Mitigations & Proof of Concept (PoC)
### PoC: Brute Force Attempt
- **Vulnerability**: Attacker scripts multiple login attempts.
- **Mitigation**: `express-rate-limit` blocks the IP after 10 attempts, and the user account is locked by the backend logic after 5 failures.

### PoC: Session Hijacking
- **Vulnerability**: Stealing cookies via cross-site scripts.
- **Mitigation**: `httpOnly` flag prevents JavaScript from accessing the cookie, making traditional session theft impossible.
