# Hackathon.app

A modern platform for hosting and participating in hackathon events with seamless team collaboration, project submissions, and real-time updates.

## 🚀 Features

### For Participants
- **Event Discovery**: Browse and search upcoming hackathons
- **Team Management**: Create teams, invite members, collaborate
- **Project Submissions**: Submit projects with GitHub integration
- **Real-time Updates**: Get notifications for deadlines and announcements
- **Discord Integration**: Seamless authentication and communication

### For Event Organizers
- **Event Creation**: Create and manage hackathon events
- **Participant Management**: Track registrations and teams
- **Judging System**: Score projects and select winners
- **Analytics**: Monitor event participation and engagement

## 🎨 Design System

### Modern UI/UX
- **Clean, Professional Design**: Focus on readability and usability
- **Mobile-First Responsive**: Works perfectly on all devices
- **Accessibility**: WCAG compliant with proper contrast and navigation
- **Gamification Elements**: Progress indicators, countdown timers, achievement badges

### Color Palette
- **Primary**: Blue (#2563eb) - Trust, professionalism
- **Secondary**: Green (#16a34a) - Success, growth
- **Accent**: Purple (#9333ea) - Innovation, creativity
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font**: Geist Sans (modern, readable)
- **Hierarchy**: Clear heading structure for easy scanning
- **Spacing**: Consistent padding and margins throughout

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Discord OAuth2 via NextAuth.js
- **Deployment**: Vercel

## 📱 Pages & Components

### Landing Page (`/`)
- Hero section with clear value proposition
- Feature highlights with icons
- Call-to-action buttons
- Modern gradient background

### Dashboard (`/dashboard`)
- Quick stats overview
- Upcoming events grid
- Team management sidebar
- Search and filter functionality

### Event Details (`/event/[id]`)
- Comprehensive event information
- Registration status
- Schedule and rules
- Prize breakdown
- Quick action buttons

### Login (`/login`)
- Discord OAuth integration
- Clean, focused design
- Feature highlights

## 🚧 Next Steps

### Phase 1: Core Functionality
1. **Database Schema**: Design Supabase tables for events, teams, users, submissions
2. **Authentication**: Implement Discord OAuth with NextAuth.js
3. **Event CRUD**: Create, read, update, delete events
4. **Team Management**: Team creation, member invites, role management

### Phase 2: Advanced Features
1. **Project Submissions**: GitHub integration, file uploads
2. **Judging System**: Scoring, feedback, winner selection
3. **Notifications**: Email and Discord notifications
4. **Admin Panel**: Event management, user moderation

### Phase 3: Polish & Scale
1. **Analytics**: Event insights, participation metrics
2. **Mobile App**: React Native companion app
3. **API Documentation**: Public API for integrations
4. **Performance**: Optimization and caching

## 🏃‍♂️ Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Create .env.local file with the following variables:
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Discord OAuth Configuration (configured in Supabase Dashboard)
   # No additional environment variables needed
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

```sql
-- TEAMS TABLE
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- TEAM MEMBERS TABLE (many-to-many)
create table team_members (
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (team_id, user_id)
);

-- EVENTS TABLE
create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  rules text,
  votes_per_user integer not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- REGISTRATIONS TABLE (a team registers for an event)
create table registrations (
  team_id uuid references teams(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (team_id, event_id)
);

-- SUBMISSIONS TABLE (one per team per event)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  repo_url text,
  demo_url text,
  description text,
  submitted_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  votes integer default 0
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ for the developer community
