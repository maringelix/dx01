# Security Policy

## Reporting Vulnerabilities

If you discover a security issue, **do not** open a public issue. Contact the maintainer privately via GitHub.

## Security Posture

| Layer | Control |
|-------|---------|
| **Secrets** | All credentials via environment variables; no defaults in code |
| **Container** | Non-root (`USER node`), multi-stage build, minimal attack surface |
| **Network** | CORS restricted to configured origin, Helmet security headers |
| **Database** | Parameterized queries (pg), TLS with certificate validation |
| **CI** | Automated test suite on push; deploy requires manual dispatch |
| **Dependencies** | Lock files committed, `npm audit` in CI |

## Environment Variables

All sensitive configuration is injected at runtime via environment variables or Kubernetes Secrets.
See `server/.env.example` for the full list of required variables.

No `.env` files, API keys, or credentials are committed to this repository.
