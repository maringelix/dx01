# 🚀 DX01 - Fullstack Application

[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Not%20Computed-lightgrey.svg)](https://sonarcloud.io/)
[![Security](https://img.shields.io/badge/Security-A%20Rating-brightgreen.svg)](https://sonarcloud.io/)
[![Reliability](https://img.shields.io/badge/Reliability-A%20Rating-brightgreen.svg)](https://sonarcloud.io/)
[![Maintainability](https://img.shields.io/badge/Maintainability-A%20Rating-brightgreen.svg)](https://sonarcloud.io/)
[![Code Lines](https://img.shields.io/badge/Lines%20of%20Code-833-blue.svg)](https://github.com/maringelix/dx01)

Uma aplicação fullstack moderna com React + Vite no frontend e Node.js + Express no backend, pronta para deploy em produção.

## 📋 Índice

- [Sobre](#sobre)
- [Code Quality](#-code-quality)
- [Testing](#-testing)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Build e Deploy](#build-e-deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

## 🎯 Sobre

DX01 é uma aplicação fullstack completa que demonstra:
- ✅ Frontend React com Vite para desenvolvimento rápido
- ✅ Backend RESTful com Express
- ✅ Health check endpoint para AWS ALB
- ✅ CORS e segurança configurados
- ✅ Hot reload em desenvolvimento
- ✅ Pronto para containerização Docker

## 📊 Code Quality

<div align="center">

| Metric | Rating | Issues | Status |
|--------|--------|--------|--------|
| **Security** | 🟢 A | 0 | Perfect |
| **Reliability** | 🟢 A | 4 | Excellent |
| **Maintainability** | 🟢 A | 8 | Excellent |
| **Coverage** | 🟡 ~35% | - | Basic tests implemented |
| **Duplications** | 🟢 0.0% | 0 | No duplicates |
| **Lines of Code** | 📝 833 | - | React + Node.js |

*Analyzed with SonarQube. This is an application project focusing on functionality.*

</div>

## 🧪 Testing

### Test Coverage

```bash
# Backend tests (Jest)
cd server
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Frontend tests (Vitest)
cd client
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Test Structure

```
server/tests/
├── health.test.js        # Health check endpoint tests
├── database.test.js      # Database utility tests
└── ...

client/src/tests/
├── App.test.jsx          # React component tests
├── setup.js              # Test configuration
└── ...
```

### CI/CD Testing

Tests run automatically on every push via GitHub Actions:
- ✅ Backend unit tests (Jest)
- ✅ Frontend component tests (Vitest)
- ✅ Coverage reports generated
- ✅ Automated quality gates

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **Vite 5** - Build tool e dev server
- **Axios** - Cliente HTTP
- **CSS3** - Estilização

### Backend
- **Node.js 18+** - Runtime
- **Express 4** - Framework web
- **ES Modules** - Sintaxe moderna
- **Helmet** - Segurança HTTP
- **Morgan** - Logger de requisições
- **CORS** - Cross-Origin Resource Sharing

### DevOps
- **Concurrently** - Executar múltiplos processos
- **Nodemon** - Auto-reload no desenvolvimento
- **Git** - Controle de versão

## ⚙️ Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Git

## 📦 Instalação

### Clone o repositório
```bash
git clone https://github.com/maringelix/dx01.git
cd dx01
```

### Instale todas as dependências
```bash
npm run install:all
```

Ou manualmente:
```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

## 🚀 Desenvolvimento

### Iniciar ambos os servidores (recomendado)
```bash
npm run dev
```

Isso inicia:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Iniciar servidores separadamente

**Backend apenas:**
```bash
npm run dev:server
# ou
cd server && npm run dev
```

**Frontend apenas:**
```bash
npm run dev:client
# ou
cd client && npm run dev
```

## 📦 Build e Deploy

### Build do frontend
```bash
npm run build
```

Gera os arquivos otimizados em `client/dist/`

### Iniciar em produção
```bash
npm start
```

Serve o backend na porta configurada (padrão: 5000)

## 📁 Estrutura do Projeto

```
dx01/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── App.jsx        # Componente principal
│   │   ├── App.css        # Estilos do App
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Estilos globais
│   ├── index.html         # Template HTML
│   ├── vite.config.js     # Config do Vite
│   └── package.json       # Dependências do client
│
├── server/                 # Backend Express
│   ├── index.js           # Entry point da API
│   ├── .env.example       # Exemplo de variáveis
│   └── package.json       # Dependências do server
│
├── package.json           # Scripts do monorepo
├── .gitignore            # Arquivos ignorados
└── README.md             # Este arquivo
```

## 🔌 API Endpoints

### Health Check
```http
GET /health
```
Retorna status da aplicação (para AWS ALB)

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-28T12:00:00.000Z",
  "uptime": 123.45
}
```

### API Info
```http
GET /api
```
Informações da API

**Response:**
```json
{
  "message": "Bem-vindo à API dx01! 🚀",
  "version": "1.0.0"
}
```

### Listar Usuários
```http
GET /api/users
```

**Response:**
```json
{
  "users": [
    { "id": 1, "name": "Marina", "role": "DevOps Engineer" },
    { "id": 2, "name": "GitHub Copilot", "role": "AI Assistant" }
  ]
}
```

### Criar Usuário
```http
POST /api/users
Content-Type: application/json

{
  "name": "João Silva",
  "role": "Developer"
}
```

**Response:**
```json
{
  "message": "Usuário criado com sucesso!",
  "user": { "id": 3, "name": "João Silva", "role": "Developer" }
}
```

## 🔐 Variáveis de Ambiente

### Backend (`server/.env`)

```env
# Porta do servidor
PORT=5000

# Ambiente
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend

As variáveis do Vite são configuradas em `vite.config.js`:
- Porta: 3000
- Proxy API: http://localhost:5000

## 🐳 Docker

### Build da imagem
```bash
docker build -t dx01:latest .
```

### Executar container
```bash
docker run -p 5000:5000 -p 3000:3000 dx01:latest
```

## 🧪 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia frontend e backend em modo dev |
| `npm run dev:server` | Inicia apenas o backend |
| `npm run dev:client` | Inicia apenas o frontend |
| `npm run build` | Build de produção do frontend |
| `npm start` | Inicia backend em produção |
| `npm run install:all` | Instala todas as dependências |

## 🚀 Deploy em Produção

### Opção 1: Docker + AWS ECS
1. Build da imagem Docker
2. Push para ECR
3. Deploy no ECS com ALB

### Opção 2: Servidor tradicional
1. Clone o repositório no servidor
2. Configure as variáveis de ambiente
3. Execute `npm run install:all`
4. Execute `npm run build`
5. Execute `npm start` com PM2 ou similar

### Opção 3: Serverless
- Frontend: Deploy em S3 + CloudFront
- Backend: Deploy em Lambda + API Gateway

## 📊 Monitoramento

O endpoint `/health` pode ser usado para:
- Health checks do Load Balancer
- Monitoramento de uptime
- Verificação de disponibilidade

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Convenção de Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de build/config

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autor

**Marina Felix**
- GitHub: [@maringelix](https://github.com/maringelix)

## 🔗 Links Relacionados

- [tx01](https://github.com/maringelix/tx01) - Infraestrutura AWS com Terraform
- [Documentação React](https://react.dev/)
- [Documentação Express](https://expressjs.com/)
- [Documentação Vite](https://vitejs.dev/)

---

⭐ Se este projeto foi útil, considere dar uma estrela!
