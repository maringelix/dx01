# Security Policy

## 🔒 Security Overview

This project follows security best practices for web applications.

## ✅ What's Safe to Share Publicly

This repository is **safe to be public** because:

- ✅ **No credentials in code** - All secrets are managed via environment variables
- ✅ **No .env files** - Environment files are gitignored
- ✅ **No API keys** - All keys are externalized
- ✅ **No database passwords** - Credentials injected at runtime
- ✅ **`.env.example` only** - Template file without real values

## 🔐 Secrets Management

### Local Development

Create a `.env` file in the `server/` directory:

```bash
# Copy from template
cp server/.env.example server/.env

# Add your real credentials (this file is gitignored)
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database (local development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=yourpassword
```

### Production (Kubernetes)

Database credentials are injected via Kubernetes Secrets:

```bash
# Secrets are created by the deployment workflow
# Values come from AWS RDS via Terraform outputs
kubectl create secret generic db-credentials \
  --from-literal=host=$DB_HOST \
  --from-literal=port=$DB_PORT \
  --from-literal=database=$DB_NAME \
  --from-literal=username=$DB_USER \
  --from-literal=password=$DB_PASSWORD
```

### GitHub Actions

Configure these secrets in `Settings > Secrets and variables > Actions`:

```
AWS_ACCESS_KEY_ID       - For ECR push
AWS_SECRET_ACCESS_KEY   - For ECR push
```

## 🛡️ Security Features Implemented

### Application Security

- **Environment Variables**: All configs externalized
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Sanitization on user inputs
- **SQL Injection Protection**: Using parameterized queries
- **XSS Protection**: React escapes by default
- **Health Checks**: Monitoring endpoints

### Dependencies Security

- **Automated Updates**: Dependabot enabled
- **Vulnerability Scanning**: npm audit on every build
- **Lock Files**: package-lock.json committed
- **Regular Updates**: Dependencies kept up-to-date

### Container Security

- **Multi-stage Build**: Minimal attack surface
- **Non-root User**: Container runs as node user
- **No Secrets in Image**: All injected at runtime
- **Base Image Updates**: Using latest LTS versions

## 🚨 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email the maintainer privately
3. Provide detailed reproduction steps
4. Allow time for investigation and patch

## 📋 Security Checklist for Production

- [ ] Environment variables configured
- [ ] CORS origins properly set
- [ ] Database credentials secure
- [ ] HTTPS/TLS enabled
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] Logging configured
- [ ] Error handling implemented
- [ ] Security headers set
- [ ] Regular dependency updates

## 🔍 Security Audits

Regular checks performed:

- ✅ No credentials in code
- ✅ No .env files committed
- ✅ No API keys hardcoded
- ✅ `.gitignore` properly configured
- ✅ Dependencies up to date
- ✅ No known vulnerabilities (npm audit)
- ✅ SonarQube security scan passed

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://react.dev/learn/security)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## 🏷️ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## 📞 Contact

For security questions, contact the repository owner through GitHub.

---

**Last Updated**: December 2025
**Security Review**: Passed ✅
