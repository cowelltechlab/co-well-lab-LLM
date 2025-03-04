# co-well-lab-LLM

A language model-powered backend for generating AI-assisted cover letters from resumes.

## Development with Docker

This project uses Docker Compose to run four services in a containerized environment:

- **MongoDB**: Database service (accessible on port `27017`)
- **Express**: Backend service (hot reloading enabled via Nodemon, accessible on port `3000`)
- **Flask**: Python backend service (hot reloading enabled via watchdog, handles resume processing and OpenAI calls, accessible on port `5002`)
- **Vite-React**: Frontend service
  - **Development Mode**: Runs the Vite dev server with hot reloading on port `5173`
  - **Production Mode**: (if needed) builds and serves static files via Nginx on port `80`

---

## **Getting Started**

### **1. Clone the Repository**

```sh
git clone https://github.com/your-repo/co-well-lab-LLM.git
cd co-well-lab-LLM
```

### **2. Set Up Environment Variables**

Create a `.env` file in the root directory and add the necessary credentials.  
There is an example `.env` file called `.env copy` with the following variables:

```env
PYTHONUNBUFFERED=1
AZURE_OPENAI_ENDPOINT=https://vds-openai-test-001.openai.azure.com/
AZURE_OPENAI_KEY=
PLATFORM_OPENAI_KEY=
AZURE_OPENAI_DEPLOYMENT=TEST-Embedding
```

### **3. Start the Services**

Run the following command from the project root:

```sh
docker-compose up --build
```

This will:

- Build the Docker images
- Start all services (`MongoDB`, `Express`, `Flask`, `Vite-React`)

### **4. Access the Services**

Once running, the services can be accessed as follows:

- **MongoDB** → localhost:27017 _(Use MongoDB Compass for visualization)_
- **Express API** → http://localhost:3000
- **Flask API** → http://localhost:5002
- **Vite-React (Frontend)** → http://localhost:5173 _(Hot reloading enabled)_

---

## **Resume Processing & Cover Letter Generation**

To generate a cover letter, submit a `POST` request to **Express** at:
`POST http://localhost:3000/api/resume/cover-letter`

### **Request Format**

Send the request with **FormData** containing:

- `pdf` → A PDF resume file
- `job_desc` → The job description text

### **Example Using Postman or cURL**

#### **Postman Setup**

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/resume/cover-letter`
- **Body**:
  - Select `form-data`
  - Upload `pdf` (a resume file)
  - Add a `job_desc` field with the job description text

#### **cURL Example**

```sh
curl -X POST http://localhost:3000/api/resume/cover-letter \
  -F "pdf=@example.pdf" \
  -F "job_desc=We are looking for fullstack software engineers..."
```

### **Example Files for Testing**

- **Example Resume**: `example.pdf` (located in the root directory)
- **Example Job Description**:

`We are looking for fullstack software engineers to join our product team and help build interfaces and APIs to interact with large language models. You will work with a team of engineers and researchers to design and implement key components of our product and platform.`

---

## **Working with Docker Containers**

### **Hot Reloading**

- Express, Flask, and Vite-React **automatically reload** when code changes.

### **Viewing Logs**

To view logs from all services:

```sh
docker-compose logs -f
```

### **Stopping the Environment**

Press `CTRL+C` in the terminal where Docker Compose is running.

If needed, shut down the services completely:

```sh
docker-compose down
```

### **Rebuilding the Containers**

If dependencies change and need reinstalling:

```sh
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## **Production Mode**

The default setup is for **development**. To run a **production build**, use:

```sh
docker-compose -f docker-compose.yml up --build
```

- In production, the Vite-React frontend is served via **Nginx** on port `80`.

---

## **License**

_(Optional)_ TBD
