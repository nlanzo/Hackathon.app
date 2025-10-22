# Hackathon.app

## Description

Hackathon.app is a web platform that allows users to create, join, and participate in hackathon events. Users can form teams of up to 3 people, register for hackathons, submit projects, and vote on other submissions. The platform integrates with Discord for authentication and provides a complete workflow from event creation to project submission and judging.

## Motivation

Traditional hackathon organization is often fragmented across multiple tools - Discord for communication, Google Forms for registration, spreadsheets for team management, and various platforms for submissions. This creates friction for both organizers and participants. Hackathon.app consolidates everything into one platform, making it easier to discover events, form teams, track progress, and showcase projects. Whether you're a student looking to join your first hackathon or an organizer running multiple events, this platform streamlines the entire process.

## Quick Start

The easiest way to try out Hackathon.app is to visit our live demo: [https://hackathonappdemo.netlify.app/](https://hackathonappdemo.netlify.app/)

You can sign in with Discord, browse events, create or join teams, and explore the platform's features without any setup required.

## Usage

### For Participants

1. **Authentication**: Sign in using your Discord account - no additional registration needed
2. **Browse Events**: View upcoming hackathons with details about themes, rules, and prizes
3. **Team Management**:
   - Create a new team or join an existing one via invite
   - Teams are limited to 3 members maximum
   - Invite teammates using their Discord username
4. **Event Registration**: Register your team for hackathons you want to participate in
5. **Project Submission**: Submit your project with GitHub repository links, demo URLs, and descriptions
6. **Voting**: Vote on other team submissions during the judging phase

### For Organizers

1. **Event Creation**: Set up hackathons with custom themes, rules, and schedules
2. **Participant Management**: Monitor registrations and team formations
3. **Submission Review**: Access all project submissions for judging
4. **Results Management**: Publish winners and results to participants

### Key Features

- **Real-time Updates**: Live notifications for team invites, event updates, and deadlines
- **Discord Integration**: Seamless authentication and user management
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Database**: Built on Supabase with row-level security

## Contributing

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/nlanzo/hackathon.app.git
   cd hackathon.app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**

   - Create a new Supabase project
   - Run the SQL schema from the project documentation
   - Enable Discord OAuth in your Supabase dashboard (Authentication > Providers > Discord)

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Testing

```bash
# Run unit tests
npm run test

# Run linting
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

### Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Discord OAuth
- **Database**: Supabase with row-level security
- **Deployment**: Netlify (demo), Vercel-ready

### Project Structure

```
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
├── public/             # Static assets
└── supabase/           # Database migrations and types
```

This project was built for the boot.dev July 2025 hackathon and demonstrates modern full-stack development practices with Next.js and Supabase.
