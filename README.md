# co-well-lab-LLM
LLM for ND job support

## Development with Docker

This project uses Docker Compose to run four services in a containerized environment:

- MongoDB: Database service (accessible on port 27017)
- Express: Backend service (with hot reloading via nodemon, accessible on port 3000)
- Flask: Python backend service (accessible on port 5000)
- Vite-React: Frontend service
  - Development Mode: Runs the Vite dev server with hot reloading on port 5173
  - Production Mode: (if needed) builds and serves static files via Nginx on port 80

Below are the steps to set up and run the development environment from scratch.

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Git
- Docker Desktop (includes Docker Engine and Docker Compose)
  - Note: On Linux you may need to install Docker Engine and Docker Compose separately.

### Getting Started

#### 1. Clone the Repository
#### 2. Build and Start the Containers

The respository includes a base `docker-compose.yml` file and an override file `docker-compose.override.yml` that sets up services for development (including hot reloading for Vite and Express).

Run the following command from the root of the project:
```docker-compose up --build```

This will build the Docker images (using development Dockerfiles when applicable) and start all services (MongoDB, Express, Flask, and Vite-React).

#### 3. Access the Services

Once the containers are running, you can access the services as follows:
- MongoDB: Accessible internally or via GUI client like MongoDB Compass at localhost:27017
- Express API:
  - Test endpoint: http://localhost:3000/api/test-db
  - The Express service uses nodemon for hot reloading in development. Changes to the code in the express/ directory are automatically detected and the express app will restart.
- Flask API:
  - Test endpoint: http://localhost:5000/test-db
- Vite-React Frontend (Development Mode)
  - Visit: http://localhost:5173
  - Hot reloading is enabled. Changes to the code in the vite-react/ directory will automatically update the UI in the browser.

#### 4. Working with the Containers
- Hot Reloading:

The Express and Vite-React services have been set up to mount your local source code into the container. This means that any changes you make on your host machine are immediately reflected in the running containers.

- Logs and Debugging:

View logs in your terminal to see output from all services. Each service's logs are prefixed with its container name.

- Stopping the Environment:

To stop the containers, press `CTRL-C` in the terminal where Docker Compose is running.

#### 5. Switching to Production Mode

The default setup is for development. To run a production version of the Vite-React frontend (which builds and serves static files via Nginx), use the base docker-compose.yml without the development override. For example, on your VPS or in another production context, run:

```docker-compose -f docker-compose.yml up --build```

In production, the Vite-React service wil use the production Dockerfile (which performs a multi-stage build) and will be accessible on port 80.