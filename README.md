# Collaborative Alignment Research Tool

A research platform for studying human-AI collaboration in identity representation through sequential bullet refinement. This tool implements a novel workflow for investigating how users and AI systems work together to refine and align personal profile representations.

## Overview

The v1.5 system enables researchers to study collaborative alignment through:

- **Control Profile Generation**: AI-generated initial profile for baseline comparison
- **Sequential Bullet Refinement**: One-bullet-at-a-time iterative improvement workflow  
- **Collaborative Data Collection**: Likert scales and open-ended feedback at each stage
- **Aligned Profile Synthesis**: Final profile generation incorporating user refinements
- **Comparison Interface**: Side-by-side analysis of control vs aligned profiles
- **Admin Dashboard**: Researcher tools for prompt management and data analysis

## Quick Start

### Development

```bash
git clone https://github.com/cowelltechlab/co-well-lab-LLM.git
cd co-well-lab-LLM
docker-compose up --build
```

Access at:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:5002
- **Admin**: http://localhost:5173/admin

### Production

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## Environment Setup

### Flask Backend (.env)
```
PLATFORM_OPENAI_KEY=your_openai_key
SECRET_KEY=your_flask_secret
ADMIN_PASSWORD=your_admin_password
```

### React Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5002
```

## Architecture

- **Backend**: Flask API with MongoDB for session storage
- **Frontend**: React/TypeScript with Tailwind CSS
- **AI Integration**: OpenAI GPT-4o for profile and bullet generation
- **Admin Interface**: Prompt management and data export tools
- **Authentication**: Token-based user access with admin panel

## Research Workflow

1. **Welcome Input**: User provides resume and job description
2. **Control Profile**: AI generates initial profile (baseline)
3. **Bullet Refinement**: Sequential improvement of 3 BSE theory bullets
4. **Aligned Profile**: AI synthesizes final profile from user iterations
5. **Comparison**: Side-by-side evaluation of control vs aligned profiles

## Development Commands

```bash
# Start development environment
docker-compose up --build

# View logs
docker-compose logs -f

# Access MongoDB shell
docker exec -it mongodb mongosh -u root -p examplepassword

# Stop services
docker-compose down
```

## Admin Features

- **Prompt Management**: Edit AI prompts without code deployment
- **Session Export**: Download research data as CSV
- **Token Management**: Create and manage participant access tokens
- **Progress Monitoring**: Real-time system health and usage analytics

## Data Structure

Research sessions capture:
- User demographics and input data
- Control profile generation and ratings
- Complete bullet iteration history with feedback
- Aligned profile generation and final ratings
- Comparison preferences and qualitative responses

## License

MIT License - See [LICENSE](LICENSE) for details