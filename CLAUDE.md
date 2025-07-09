# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status: v1.5 Implementation - Collaborative Alignment Tool

**Current Objective**: Transform the existing cover letter generation tool into a collaborative alignment research tool that studies how users and AI systems work together to refine personal identity representations.

### Key Implementation Documents
- `/docs/v1.5-implementation-brief.md` - Detailed requirements and technical specifications
- `/docs/v1.5-user-prototype.html` - Complete user flow prototype showing all screens
- `/docs/v1.5-admin-prototype.html` - Admin dashboard with prompt management interface

### Core Changes for v1.5
1. **Sequential Bullet Refinement**: One-bullet-at-a-time workflow with unlimited iterations
2. **Research Data Collection**: Likert scales and open-ended questions at control and aligned stages
3. **Prompt Management**: Admin interface for researchers to modify prompts without code changes
4. **Collaborative Focus**: Emphasis on human-AI collaboration for identity representation

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
- `/flask/routes/`
  - `letter_lab.py` - Main API routes for cover letter generation
  - `admin.py` - Admin dashboard endpoints (login, session export, token management)
  - `chat.py` - Chat endpoint for AI interactions
  - `health.py` - Health check endpoints
- `/flask/services/`
  - `openai_service.py` - AI service for generating cover letter content
  - `mongodb_service.py` - Database operations
- `/flask/utils/`
  - `auth_decorators.py` - Contains `token_required` decorator
  - `generation_helpers.py` - `retry_generation` function for robust LLM calls
  - `validation.py` - Validation for bullet points, rationales, role names
  - `data_structuring.py` - Combines bullet points and rationales
- `/flask/models/admin_user.py` - Flask-Login user model for admin auth
- `/flask/config.py` - Application configuration

### Frontend

- `/vite-react/src/App.tsx` - Main application component and routes
- `/vite-react/src/context/`
  - `AppProvider.tsx` - Main application state management
  - `AdminProvider.tsx` - Admin authentication state
- `/vite-react/src/views/` - Application views
  - `WelcomeInputView.tsx` - Initial input of resume and job description
  - `ReviewAllView.tsx` - Overview of all generated sections
  - `ReviewSectionView.tsx` - Detailed review of a specific section
  - `CoverLetterComparisonView.tsx` - Final cover letter review
  - `AdminLoginView.tsx` - Admin authentication interface
  - `AdminDashboardView.tsx` - Admin dashboard
- `/vite-react/src/components/` - Reusable components
  - `LikertScale.tsx` - Rating scale component
  - `ChatPanel.tsx` - Chat interface for AI interactions
  - `BulletAccordionItem.tsx` - Accordion items for bullet points
  - `TextFeedbackPanel.tsx` - Text feedback collection
  - `/ui/` - Base UI components (button, card, dialog, input, etc.)
- `/vite-react/src/types.ts` - TypeScript interfaces and types
- `/vite-react/src/placeholders/placeholder_values.tsx` - Sample data for testing

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
  role_name: String  // Extracted job title
  initial_cover_letter: String
  review_all_view_intro: String
  BSETB_enactive_mastery: {
    BP_1: { text: String, rationale: String, rating: Number, qualitative: String },
    BP_2: { ... },
    BP_3: { ... }
  },
  BSETB_vicarious_experience: { ... },
  BSETB_verbal_persuasion: { ... },
  
  // Chat interactions and multi-draft support
  chat_messages: Array  // Chat history with AI
  draft_1_feedback: String
  draft_2_feedback: String
  
  // Ratings for different aspects
  chat_rating: Number
  content_representation_rating: Number
  style_representation_rating: Number
  
  // Final outputs
  final_cover_letter: String
  final_preference: String  // Which draft was preferred
  completed: Boolean
}
```

## v1.5 Implementation Requirements

### New Session Document Structure for v1.5

```javascript
{
  _id: ObjectId,
  resume: String,
  job_desc: String,
  
  // Control Profile Phase
  controlProfile: {
    text: String,
    likertResponses: {
      accuracy: Number,      // 1-7 scale
      control: Number,       // 1-7 scale
      expression: Number,    // 1-7 scale
      alignment: Number      // 1-7 scale
    },
    openResponses: {
      likes: String,
      dislikes: String,
      changes: String
    }
  },
  
  // Bullet Refinement Phase
  bulletIterations: [
    {
      bulletIndex: Number,   // 0, 1, or 2
      iterations: [
        {
          iterationNumber: Number,
          bulletText: String,
          rationale: String,
          userRating: Number,     // 1-7 scale
          userFeedback: String,
          timestamp: Date
        }
      ],
      finalIteration: Number
    }
  ],
  
  // Aligned Profile Phase
  alignedProfile: {
    text: String,
    likertResponses: { /* same structure as control */ },
    openResponses: { /* same structure as control */ }
  },
  
  completed: Boolean
}
```

### New API Endpoints Required

1. `POST /api/generate-bse-bullets` - Generate initial 3 BSE bullets
2. `POST /api/regenerate-bullet` - Regenerate single bullet with feedback
3. `POST /api/generate-aligned-profile` - Create final profile from iterations
4. `POST /api/save-iteration-data` - Save bullet iteration data

### Admin Prompt Management

Add new collection `prompts` with version control:
```javascript
{
  _id: ObjectId,
  promptType: String,  // 'control', 'bse_generation', 'regeneration', 'final_synthesis'
  content: String,
  version: Number,
  createdAt: Date,
  modifiedBy: String,
  isActive: Boolean
}
```

## Development Process

### Branch Management
- **Branch Naming**: `issue-number/description` (e.g., `issue-23/add-control-profile-endpoint`)
- **One branch per issue/feature** to maintain focused scope
- **Work directly on feature branches**, no separate commits to main

### Commit Guidelines
- **Message Format**: Multi-line with detailed body using imperative tense
  ```
  Add control profile generation endpoint
  
  - Create POST /api/generate-control-profile endpoint
  - Integrate with OpenAI service for profile generation
  - Add validation for resume and job description inputs
  - Store generated profile in MongoDB session document
  - Return profile text with session ID for frontend use
  ```
- **Include code documentation** in the same commit as code changes
- **Make commits as work is completed**, not batched at the end

### Pull Request Process
1. Complete all work for the issue scope
2. Request PR creation with detailed description of accomplishments
3. Manual review and merge through GitHub web UI

### Issue Breakdown Strategy
- **Small, focused issues** following user flow order for easy testing
- **Separate frontend and backend** work into different issues
- **Frontend components and API endpoints** as individual issues
- **Order by user flow** to enable incremental UI/UX testing

### Testing Approach
- **Feature-first development** - tests written only when bugs encountered
- **Diagnostic tests** remain standing to prevent regressions
- **No mandatory test coverage** for initial feature development