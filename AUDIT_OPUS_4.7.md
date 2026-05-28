# AUDITORIA DX01 — Opus 4.7

**Data:** 2026-05-27
**Escopo:** Full-Stack React + Node.js + Express + PostgreSQL (AWS EC2/ALB; futuro EKS)
**Modo:** Read-only (Security + Qualidade + CI/CD + Docker + K8s + Docs)

---

## Resumo Quantitativo

| Métrica | Valor |
|---------|-------|
| Server LoC (prod) | ~370 (index.js + database.js) |
| Client LoC (prod) | ~110 (App.jsx) |
| Server tests | ~195 (health + database, mocks) |
| Client tests | ~25 (App, render only) |
| **P0** | 5 |
| **P1** | 7 |
| **P2** | 7 |
| **P3** | 6 |
| **Total** | 25 |

---

## P0 — Critical (Bloqueia produção)

| # | Categoria | Título | Arquivo | Recomendação |
|---|-----------|--------|---------|---------------|
| 1 | Security / Auth | Sem autenticação em endpoints API | [server/index.js](server/index.js#L100) | `GET/POST /api/users` totalmente público. Implementar JWT (`express-jwt`) + refresh rotation. |
| 2 | Security | Sem rate limiting | [server/index.js](server/index.js#L58-L60) | Adicionar `express-rate-limit` (100 req/15min/IP). |
| 3 | Security | CORS aceita `*` se env mal configurada | [server/index.js](server/index.js#L58-L60) | Whitelist de origens validada por callback. |
| 4 | CI/CD | AWS keys sem rotação documentada | [.github/workflows/deploy-dx01.yml](.github/workflows/deploy-dx01.yml#L34-L35) | Documentar rotação 90d; migrar para OIDC + IAM role least-privilege. |
| 5 | Docker | nginx pode iniciar como root via `start.sh` | [Dockerfile](Dockerfile#L43) + [docker/start.sh](docker/start.sh#L8) | Garantir `user nginx;` em [docker/nginx.conf](docker/nginx.conf); validar `ps aux`. |

---

## P1 — High

| # | Categoria | Título | Arquivo | Recomendação |
|---|-----------|--------|---------|---------------|
| 1 | Security | Validação incompleta em POST /api/users | [server/index.js](server/index.js#L122-L124) | Adicionar regex pattern, whitelist de roles via `isIn([...])`. |
| 2 | Security | SSL RDS detectado por substring do hostname | [server/database.js](server/database.js#L25-L27) | Substituir por `DB_SSL=true` env var explícito. |
| 3 | CI/CD | Trivy scan com `continue-on-error: true` | [.github/workflows/deploy-dx01.yml](.github/workflows/deploy-dx01.yml#L58) | Mudar para `false` e usar `--severity CRITICAL --exit-code 1`. |
| 4 | CI/CD | Deploy sem approval gate | [.github/workflows/deploy-dx01.yml](.github/workflows/deploy-dx01.yml) | GitHub environment `production` com `required_reviewers`. |
| 5 | Quality | Testes frontend esqueléticos (só render) | [client/src/tests/App.test.jsx](client/src/tests/App.test.jsx) | Adicionar integração com `msw` para simular `/api/health`. |
| 6 | Security | Sem CSRF token em POST | [server/index.js](server/index.js#L120-L142) | `csurf` middleware + cookie/header token. |
| 7 | Logging | Possível vazamento de senha em erro DB | [server/database.js](server/database.js#L81) | Sanitizar `error.message` (`password=...` → REDACTED). |

---

## P2 — Medium

| # | Categoria | Título | Arquivo | Recomendação |
|---|-----------|--------|---------|---------------|
| 1 | Quality | Testes server mockam Express, não testam rotas reais | [server/tests/health.test.js](server/tests/health.test.js) | Refatorar com `supertest` no app real. |
| 2 | Quality | Sem ESLint/Prettier configurado | [client/](client/) + [server/](server/) | Adicionar `.eslintrc.json`, Prettier, Husky pre-commit. |
| 3 | Observability | `/health` retorna 200 mesmo com DB down | [server/index.js](server/index.js#L67-L75) | Separar `/health` (live) e `/ready` (readiness valida DB). |
| 4 | Docker | nginx sem CSP/Referrer-Policy/Permissions-Policy | [docker/default.conf](docker/default.conf#L11-L12) | Adicionar headers de segurança. |
| 5 | CI/CD | Sem Dependabot | [.github/](.github/) | Criar `dependabot.yml` (npm em /server e /client). |
| 6 | DB | Slow queries logadas mas sem alert | [server/database.js](server/database.js#L93-L94) | `if (duration > 1000) logger.warn(...)`; integrar CloudWatch alarm. |
| 7 | Quality | Vite proxy hardcoded para `localhost:5000` | [client/vite.config.js](client/vite.config.js#L7-L10) | `process.env.VITE_API_URL` env-driven. |

---

## P3 — Low

| # | Categoria | Título | Arquivo | Recomendação |
|---|-----------|--------|---------|---------------|
| 1 | Docs | SECURITY.md sem threat model | [SECURITY.md](SECURITY.md) | Adicionar threat model, contato PGP, known limitations. |
| 2 | Docs | README diz "EKS" mas deploy é EC2+SSM | [README.md](README.md) | Corrigir título ou clarificar roadmap EKS. |
| 3 | Quality | Pouco comment/JSDoc | [server/index.js](server/index.js) + [server/database.js](server/database.js) | JSDoc nas funções exportadas. |
| 4 | Quality | Sem TypeScript | [server/index.js](server/index.js) | Considerar v2.0. |
| 5 | Testing | Sem E2E | [.github/workflows/tests.yml](.github/workflows/tests.yml) | docker-compose ou Playwright smoke. |
| 6 | Docker | `node:18-alpine` sem patch pin | [Dockerfile](Dockerfile#L1) | Pinnar `node:18.17.1-alpine`. |

---

## Pontos Fortes

1. **SQL injection seguro**: queries parametrizadas (`$1, $2`) em [server/database.js](server/database.js#L105) e [server/index.js](server/index.js#L155).
2. **Sem credenciais hardcoded**: apenas `.env.example`.
3. **Container non-root** (`USER node`).
4. **Multi-stage Dockerfile** (builder + production).
5. **GitHub Actions pinadas a SHA**.
6. **Deploys manuais** (`workflow_dispatch`).
7. **Helmet middleware** ativo.
8. **React sem `dangerouslySetInnerHTML`**.
9. **Winston structured logging**.
10. **Graceful shutdown** (SIGTERM/SIGINT → pool close).
11. **Pre-commit hooks** com gitleaks.

---

## OWASP Top 10

| OWASP | Status | Achado |
|-------|--------|--------|
| A01 Broken Access Control | ❌ | Sem auth (P0-1) |
| A02 Cryptographic Failures | ⚠️ | SSL DB fragil (P1-2) |
| A03 Injection | ✅ | Queries parametrizadas |
| A04 Insecure Design | ❌ | Sem rate limit (P0-2) |
| A05 Security Misconfiguration | ❌ | CORS + Trivy ignorado (P0-3, P1-3) |
| A06 Vulnerable Components | ⚠️ | Sem Dependabot (P2-5) |
| A07 Auth Failures | ❌ | Sem auth (P0-1) |
| A08 Data Integrity | ❌ | Sem CSRF (P1-6) |
| A09 Logging Failures | ⚠️ | Dados sensíveis em erro (P1-7) |
| A10 SSRF | ✅ | Sem chamadas externas |

---

## Roadmap

**Fase 1 — Crítico (Semana 1):** Auth JWT, rate-limit, CORS whitelist, Trivy bloqueante, validar nginx user, documentar rotação keys.

**Fase 2 — Alto (Semana 2-3):** Input regex, SSL env-driven, CSRF, sanitização de logs, refactor de testes server, approval gate.

**Fase 3 — Médio (Sprint 2):** ESLint+Prettier+Husky, separar live/ready probes, headers nginx, Dependabot, alert slow query, vite env-driven.

**Fase 4 — Baixo:** SECURITY.md detalhada, README correto, JSDoc, E2E, pin Node patch.

---

**Risk Score:** 🔴 **1.0/1.0** — não pronto para produção; mínimo 2-3 semanas de hardening.
