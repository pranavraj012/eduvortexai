# EduVortex - AI-Powered Personalized Learning

EduVortex is an innovative educational platform that leverages AI to create personalized learning experiences. The application generates customized learning roadmaps, interactive content, quizzes, and provides an AI-powered chat assistant to guide users through their educational journey.

## Features

- **AI-Generated Learning Roadmaps**: Automatically create comprehensive learning paths for any topic
- **Interactive Content**: Generate detailed educational content for each node in the learning path
- **Quizzes and Assessments**: Test your knowledge with AI-generated quizzes specific to each topic
- **AI Assistant**: Chat with an AI tutor that can answer questions and provide guidance
- **Progress Tracking**: Track your advancement through learning paths

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend**: Supabase for authentication, database, and edge functions
- **AI**: Google's Gemini API for content generation and chat functionality

## Getting Started

### Prerequisites

- Node.js and npm
- Supabase account
- Google Gemini API key

### Installation

1. Clone the repository
   ```sh
   git clone <YOUR_REPO_URL>
   cd edu-vortex-learn-41
   ```

2. Install dependencies
   ```sh
   npm install
   ```

3. Environment Setup
   - Create a `.env.local` file in the root directory
   - Add the following environment variables:
   ```
   # Supabase credentials
   VITE_SUPABASE_URL=<your db url>
   VITE_SUPABASE_ANON_KEY= <your key>
   # Gemini API key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server
   ```sh
   npm run dev
   ```

## Supabase Edge Functions

For the edge functions to access environment variables, you need to set them in the Supabase dashboard:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

## Architecture

EduVortex is built with a modern, serverless architecture:

1. **React Frontend**: Provides the user interface and experience
2. **Supabase Backend**: Handles authentication, database operations, and serverless functions
3. **Gemini API Integration**: Powers the AI features through Supabase edge functions

## Roadmap Generation Process

1. User enters a topic they want to learn
2. The application sends a request to the Gemini API via Supabase edge functions
3. The AI generates a structured roadmap with nodes representing subtopics
4. The roadmap is displayed visually for the user to navigate

## Content Generation

When a user selects a node in the roadmap:
1. The application requests detailed content about that specific topic
2. Gemini API generates comprehensive educational material with examples and exercises
3. Content is rendered in a readable format with proper Markdown styling

## Quiz Generation

For knowledge testing:
1. AI generates topic-specific multiple-choice questions
2. Each question includes explanations for the correct answer
3. User performance is tracked and can guide further learning

## Development

This project was developed during a hackathon to demonstrate the potential of AI in personalized education.

## License

[Add your license information here]

## Acknowledgments

- Google Gemini API for powering the AI features
- Supabase for providing the backend infrastructure
- Lovable for the development platform
