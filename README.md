# co-well-lab-LLM

A language model-powered backend for generating AI-assisted cover letters from resumes.

## Table of Contents

- [Development](#development)
  - [Clone the Repository](#clone-the-repository)
  - [Set Up Environment Variables](#set-up-environment-variables)
  - [Start the Services](#start-the-services)
  - [Access the Services](#access-the-services)
- [Production](#production)
  - [Prepare Environment Files](#prepare-environment-files)
  - [Run the Production Build](#run-the-production-build)
  - [Post-Deployment Maintenance](#post-deployment-maintenance)
- [Working with Docker](#working-with-docker)
  - [Hot Reloading](#hot-reloading)
  - [Viewing Logs](#viewing-logs)
  - [Stopping the Environment](#stopping-the-environment)
  - [Rebuilding Containers](#rebuilding-containers)
  - [Pruning Docker System](#pruning-docker-system)
- [License](#license)

---

## Development

### Clone the Repository

```bash
git clone https://github.com/your-repo/co-well-lab-LLM.git
cd co-well-lab-LLM
```

### Set Up Environment Variables

**Frontend (`vite-react`)**

Create a `.env` file in `vite-react/`:

```dotenv
VITE_API_BASE_URL=""
```

This enables development proxying to Flask during local development.

**Backend (`flask`)**

Create a `.env` file in `flask/` or use the provided `.env copy`:

```dotenv
PYTHONUNBUFFERED=1
AZURE_OPENAI_ENDPOINT=https://vds-openai-test-001.openai.azure.com/
AZURE_OPENAI_KEY=
PLATFORM_OPENAI_KEY=
AZURE_OPENAI_DEPLOYMENT=TEST-Embedding
```

### Start the Services

Run in the root directory:

```bash
docker-compose up --build
```

This uses:

- `docker-compose.yml`
- `docker-compose.override.yml` (automatically loaded)

### Access the Services

- **Frontend**: http://localhost:5173
- **API (Flask)**: http://localhost:5002
- **MongoDB**: localhost:27017 (use Compass or another DB client)

---

## Production

### Prepare Environment Files

**Frontend**

Create a `.env.production` in `vite-react/`:

```dotenv
VITE_API_BASE_URL=https://api.letterlab.me
```

**Backend**

Create a `.env.prod` file in `flask/` with all required keys. This will be used by `docker-compose.prod.yml`.

### Run the Production Build

Use the production compose file:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

This spins up:

- Flask behind Gunicorn
- Vite build served with Nginx
- MongoDB with volume persistence
- Caddy as HTTPS reverse proxy

### Post-Deployment Maintenance

You’ll find a helper file with commands under:

```
docs/docker-commands
```

Be sure to review this for:

- Port pruning
- Backup suggestions
- Docker health check ideas

---

## Working with Docker

### Hot Reloading

- Development mode auto-reloads Flask and Vite when code changes.

### Viewing Logs

```bash
docker-compose logs -f
```

For production:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Stopping the Environment

```bash
docker-compose down
```

Production:

```bash
docker-compose -f docker-compose.prod.yml down
```

### Rebuilding Containers

```bash
docker-compose build --no-cache
```

Production:

```bash
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Pruning Docker System

If you run into persistent container issues on the server:

```bash
docker system prune -a --volumes
```

⚠️ This will remove all stopped containers, networks, volumes, and images not in use. Use with care.

---

## License

TBD
