# DevMetrics

A small but focused developer analytics website that turns your GitHub activity into clear, beautiful insights.

Live Demo: https://devmetrics-b1bl.vercel.app/ 

## About the Project

DevMetrics is a lightweight full-stack application that connects to your GitHub account and shows you meaningful patterns in how you code — not just raw numbers.

It includes personal productivity tracking, visual contribution graphs, an AI-generated weekly summary, public shareable profiles, and basic team features.

## All Features Implemented

### Authentication
- GitHub OAuth login (only login method)
- JWT-based session handling
- Protected routes

### Dashboard
- Live sync with GitHub (repositories + commits)
- Auto-refresh every 5 minutes
- Sync on tab focus
- Manual “Refresh now” button
- Stats cards: Total Commits, Repositories, Contributors
- Recent commits list

### Visual Analytics
- **Contribution Heatmap** – GitHub-style calendar of the last year
- **Commit Punch Card** – Hour × Day-of-week activity grid
- **Peak Hours** chart
- **Activity Chart**
- **Language / Tech Breakdown** (donut chart)
- **Streak Card** (current + longest streak)

### Year in Review
- Spotify-style recap card
- Total commits, active days, average per day
- Busiest day, peak hour, top repository, most productive month

### AI Weekly Digest
- One-click “Generate Digest” button
- Uses Groq (free tier) to write a plain-English summary of your last 7 days
- Shows what you focused on, activity spikes, and an encouraging note

### Public Profile
- Shareable page at `/u/username`
- Shows avatar, streaks, contribution mini-heatmap, top languages, top repositories
- “Share profile” button on dashboard (copies the link)

### Settings
- Sync frequency preference
- Include private repositories toggle

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router
- Tailwind CSS + custom aurora design system
- Custom glassmorphism UI

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Passport.js (GitHub Strategy)
- JSON Web Tokens (JWT)
- Octokit (GitHub API)

**AI**
- Groq API (Llama 3.3) for weekly digest

**Deployment**
- Frontend → Vercel
- Backend → Render
