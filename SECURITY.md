# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report vulnerabilities via email to `security@vaultlease.edu`.

## Implemented Security Features

### 1. Authentication & Session Management
- **Role-Based MFA**: Mandatory for Admins, optional for Students.
- **Secure Sessions**: HTTP-Only, SameSite=Lax cookies.
- **Session Tracking**: Detection of IP anomalies and sudden device changes.
- **Token Revocation**: Immediate invalidation on logout via token versioning.

### 2. Network Security
- **Rate Limiting**:
  - `Login`: Strict limits on auth endpoints.
  - `Payment`: High-restriction limits (10/hr) on payment routes.
  - `General`: Basic flood protection on all routes.
- **Headers**: Helmet active for HSTS, X-Frame-Options, etc.

### 3. Data Protection
- **Encryption**: Data at rest (Bcrypt password hashing) and in transit (HTTPS support).
- **Validation**: Strict environment variable validation on startup.
- **Audit Logging**: Comprehensive logs for all sensitive actions (Login, Anomaly, Profile Update).
