# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment Setup & Commands

### Development

```bash
# Start the development environment
docker-compose up --build

# View logs
docker-compose logs -f

# Stop the environment
docker-compose down
```

### Production

```bash
# Build and run the production environment
docker-compose -f docker-compose.prod.yml up --build -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop the production environment
docker-compose -f docker-compose.prod.yml down
```

### Frontend (Vite React)

```bash
# Run development server (when working outside Docker)
cd vite-react
npm install
npm run dev

# Build for production
cd vite-react
npm run build

# Lint code
cd vite-react
npm run lint
```

### MongoDB

```bash
# Access MongoDB shell
docker exec -it mongodb mongosh -u root -p examplepassword --authenticationDatabase admin

# Access the application database
use cover_letter_app

# Example: Find a specific session
db.sessions.findOne({ _id: ObjectId("your-session-id") })
```

## Architecture Overview

### System Components

1. **Flask Backend**
   - Python-based API server using Flask
   - Interacts with Azure OpenAI for AI processing
   - Handles token validation, session management, and cover letter generation

2. **React Frontend**
   - TypeScript-based UI built with Vite, React Router, and Tailwind CSS
   - Contains views for the cover letter generation workflow
   - Uses context for state management

3. **MongoDB**
   - Stores session data, generated content, and user feedback
   - Used for token validation and progress tracking

4. **Caddy (Production)**
   - Serves as HTTPS reverse proxy in production
   - Routes traffic to the appropriate services

### Data Flow

1. User enters resume and job description
2. Flask backend calls OpenAI to generate structured cover letter elements
3. Elements are stored in MongoDB with a unique session ID
4. User provides feedback on generated content through the frontend
5. Feedback is sent to the backend and stored in MongoDB
6. Final cover letter is generated incorporating user feedback

## Key Concepts

### Cover Letter Generation Process

The application uses **Bandura's Self-Efficacy Theory (BSET)** to structure cover letters with three belief categories:

1. **Enactive Mastery Experience** - Confidence through direct experience
2. **Vicarious Experience** - Confidence from observing others
3. **Verbal Persuasion** - Confidence through encouragement/feedback

Each section generates bullet points and rationales based on the user's resume and target job description.

### Authentication

- Token-based access system for end users
- Admin login for monitoring and management
- Flask provides token validation via decorators

## Important Files

### Backend

- `/flask/main.py` - Flask application entry point
- `/flask/routes/letter_lab.py` - Main API routes for cover letter generation
- `/flask/services/openai_service.py` - AI service for generating cover letter content
- `/flask/services/mongodb_service.py` - Database operations
- `/flask/config.py` - Application configuration

### Frontend

- `/vite-react/src/App.tsx` - Main application component and routes
- `/vite-react/src/context/AppProvider.tsx` - State management
- `/vite-react/src/views/` - Application views for different steps
  - `WelcomeInputView.tsx` - Initial input of resume and job description
  - `ReviewAllView.tsx` - Overview of all generated sections
  - `ReviewSectionView.tsx` - Detailed review of a specific section
  - `CoverLetterComparisonView.tsx` - Final cover letter review

### Configuration

- `docker-compose.yml` - Base configuration for all environments
- `docker-compose.override.yml` - Development-specific settings (auto-loaded)
- `docker-compose.prod.yml` - Production-specific settings
- `Caddyfile` - Caddy server configuration for production

## Environment Variables

### Flask Backend

Required in `.env` (development) or `.env.prod` (production):
```
PYTHONUNBUFFERED=1
AZURE_OPENAI_ENDPOINT=<your_azure_openai_endpoint>
AZURE_OPENAI_KEY=<your_azure_openai_key>
PLATFORM_OPENAI_KEY=<optional_platform_openai_key>
SECRET_KEY=<flask_secret_key>
ADMIN_PASSWORD=<admin_dashboard_password>
```

### Frontend

Required in `.env` (development) or `.env.production` (production):
```
VITE_API_BASE_URL=<api_base_url>
```

## Database Structure

### Collections

- **sessions** - Main document store for cover letter generation sessions
- **tokens** - Access tokens for user authentication
- **progress_log** - Event tracking for application usage

### Session Document Structure

```
{
  _id: ObjectId
  resume: String
  job_desc: String
  initial_cover_letter: String
  review_all_view_intro: String
  BSETB_enactive_mastery: {
    BP_1: { text: String, rationale: String, rating: Number, qualitative: String },
    BP_2: { ... },
    BP_3: { ... }
  },
  BSETB_vicarious_experience: { ... },
  BSETB_verbal_persuasion: { ... },
  final_cover_letter: String,
  completed: Boolean
}
```