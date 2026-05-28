# dx01 — Fullstack Application (AWS / EC2 + ALB)

Fullstack web application built with **React + Vite** (client) and **Node.js + Express** (server), backed by **PostgreSQL**. Designed for production deployment on **AWS EC2 behind an ALB** via CI/CD (deploy through SSM; ECR for images). Infrastructure is provisioned by [tx01](https://github.com/maringelix/tx01).

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│  React/Vite │─────▶│ Express API  │─────▶│ PostgreSQL │
│  (nginx)    │      │  (Node 20)   │      │  (RDS)     │
└─────────────┘      └──────────────┘      └────────────┘
        └── served via nginx reverse proxy ──┘
```

- **Client**: React 18, Vite, Axios
- **Server**: Express, Helmet, CORS, Winston logger, pg driver
- **Database**: PostgreSQL (local or AWS RDS)
- **Container**: Multi-stage Docker build, non-root user
- **CI/CD**: GitHub Actions — tests on push, deploy via manual dispatch

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check (ALB target) |
| GET | `/api` | Root info + visit tracking |
| GET | `/api/health` | API health with DB status |
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user (validated) |

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start development (client + server concurrently)
npm run dev
```

### Environment Variables

Copy the template and fill in your values:

```bash
cp server/.env.example server/.env
```

Required variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `CORS_ORIGIN`.

## Docker

```bash
docker build -t dx01 .
docker run -p 80:80 -p 3001:3001 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=myapp \
  -e DB_USER=postgres \
  -e DB_PASSWORD=changeme \
  dx01
```

## Testing

```bash
# Server tests (Jest)
cd server && npm test

# Client tests (Vitest)
cd client && npm test
```

## Deployment

The deploy workflow (`deploy-dx01.yml`) is **manual-only** (`workflow_dispatch`).
It builds and pushes to **AWS ECR**, deploys to **EC2** instances via **SSM**, and verifies health through the **ALB**.

Infrastructure is provisioned separately via [tx01](https://github.com/maringelix/tx01).

## Project Structure

```
dx01/
├── client/           # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   └── tests/    # Vitest + Testing Library
│   └── vite.config.js
├── server/           # Express backend
│   ├── index.js      # Routes and middleware
│   ├── database.js   # PostgreSQL connection pool
│   └── tests/        # Jest + Supertest
├── docker/           # nginx config + entrypoint
├── Dockerfile        # Multi-stage build
└── .github/workflows/
    ├── tests.yml     # CI — runs on push
    └── deploy-dx01.yml  # CD — manual dispatch
```

## Related Repositories

| Repo | Description |
|------|-------------|
| [tx01](https://github.com/maringelix/tx01) | AWS infrastructure (Terraform) |
| [tx00](https://github.com/maringelix/tx00) | Audit & standards tracker |

## License

MIT
