# Run dev containers
dev:
	docker compose up --build

# Stop dev containers
dev-down:
	docker compose down

# Run prod containers
prod:
	docker compose -f docker-compose.prod.yml up -d --build

# Stop prod containers
prod-down:
	docker compose -f docker-compose.prod.yml down

# Rebuild just vite-react for prod (e.g. after frontend changes)
build-frontend:
	docker compose -f docker-compose.prod.yml build vite-react

# Rebuild just flask for prod
build-backend:
	docker compose -f docker-compose.prod.yml build flask
