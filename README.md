# co-well-lab-LLM

A language model-powered backend for generating AI-assisted cover letters from resumes.

## Development with Docker

This project uses Docker Compose to run three services in a containerized environment:

- **MongoDB**: Database service (accessible on port `27017`)
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
- Start all services (`MongoDB`, `Flask`, `Vite-React`)

### **4. Access the Services**

Once running, the services can be accessed as follows:

- **MongoDB** → localhost:27017 _(Use MongoDB Compass for visualization)_
- **Flask API** → http://localhost:5002
- **Vite-React (Frontend)** → http://localhost:5173 _(Hot reloading enabled)_

---

## **Testing API Endpoints**

### **Test MongoDB Connection**

To verify that MongoDB is properly connected to Flask, send a `GET` request:

#### **Postman Setup**

- **Method**: `GET`
- **URL**: `http://localhost:5002/test-mongo`

#### **cURL Example**

```sh
curl -X GET http://localhost:5002/test-mongo
```

### **Cover Letter Generation**

To generate a cover letter, submit a `POST` request to **Flask** at:
`POST http://localhost:5002/cover-letter`

#### **Postman Setup**

- **Method**: `POST`
- **URL**: `http://localhost:5002/cover-letter`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  - Select `raw` → `JSON` format

```json
{
  "resume_text": "Experienced software engineer with expertise in Python and backend development.",
  "job_desc": "Looking for a backend engineer with experience in Flask and MongoDB."
}
```

#### **cURL Example**

```sh
curl -X POST "http://localhost:5002/cover-letter" \
     -H "Content-Type: application/json" \
     -d '{"resume_text": "Experienced software engineer with expertise in Python and backend development.", "job_desc": "Looking for a backend engineer with experience in Flask and MongoDB."}'
```

### **Fetching Cover Letter in React**

Example fetch request from the React frontend:

```javascript
async function generateCoverLetter(resumeText, jobDesc) {
  const response = await fetch("http://localhost:5002/cover-letter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resume_text: resumeText, job_desc: jobDesc }),
  });
  const data = await response.json();
  return data.cover_letter;
}
```

---

## **Working with Docker Containers**

### **Hot Reloading**

- Flask and Vite-React **automatically reload** when code changes.

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
