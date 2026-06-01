# Raj Kaushal Employment Exchange Portal

A full-stack employment exchange web application for Rajasthan, connecting job seekers (workers), employers, and administrators through a unified platform with role-based access control.

**Tech Stack:** Node.js, Express.js, MongoDB Atlas, Mongoose, EJS, Express-Session, Bcrypt

---

## About

This project is a fork of an incomplete SIH (Smart India Hackathon) 2024 prototype. The original repository contained only a static frontend with hardcoded mock data and no backend. This fork completes the application by building the entire backend from scratch — database models, RESTful APIs, authentication, session management, and role-based access control.

---

## Features

### Authentication & Authorization
- Unified login for all user types (Workers, Employers, Admins)
- Tabbed signup page — Workers and Employers register through the same form with role-specific fields
- Bcrypt password hashing
- Session-based authentication via Express-Session + MongoDB session store
- Role-Based Access Control (RBAC) with three roles: `worker`, `employer`, `admin`
- Protected routes via `isLoggedIn`, `isAdmin`, and `isEmployer` middleware

### Worker (Job Seeker) Dashboard
- Profile management — update personal details, qualifications, skills, and experience
- Job search with real-time filtering by sector, location, job type, and keyword
- One-click job application with duplicate application prevention
- Application status tracking — view all applications and their current status
- Counselling session booking — schedule career guidance, skill development, or psychological sessions
- Mentorship enrollment — browse and enroll in mentorship programs, track progress
- Feedback submission — submit categorized feedback with ratings

### Employer Portal
- Job posting form — submit jobs for admin review
- All submitted jobs are saved as inactive (`isActive: false`) pending admin approval
- Accessible only to logged-in users with the `employer` role

### Admin Dashboard
- Moderation queue — view all pending (inactive) job postings
- Approve jobs — flips `isActive` to `true`, making the job visible to the public instantly
- Reject jobs — permanently deletes the job record from the database
- Accessible only to users with the `admin` role

### Public Pages
- Job listings — publicly browsable, dynamically loaded from MongoDB
- Counselling, Resources, Schemes, Contact pages
- Dynamic navbar — adapts based on login state and user role

---

## Project Structure

```
├── index.js                          # Express server, all routes, MongoDB connection
├── middleware/
│   └── auth.js                       # isLoggedIn, isAdmin, isEmployer middleware
├── models/
│   ├── User.js                       # Worker/Employer/Admin schema with bcrypt
│   ├── Job.js                        # Job schema with isActive approval flag
│   ├── Application.js                # Job application tracking
│   ├── CounsellingSession.js         # Counselling bookings
│   ├── mentorship.js                 # Mentorship enrollments
│   └── feedback.js                   # User feedback
├── Views/
│   ├── layouts/boilerplate.ejs       # Base layout
│   ├── includes/                     # Navbar, footer, home
│   ├── users/                        # Login, signup (tabbed)
│   ├── student/                      # Worker dashboard pages
│   ├── jobs/listing.ejs              # Public job board
│   ├── admin.ejs                     # Admin moderation dashboard
│   ├── employer.ejs                  # Employer job posting form
│   └── ...                           # Counselling, resources, schemes, contact
└── public/
    └── javascripts/
        ├── employer.js               # Job posting API calls
        ├── student/
        │   ├── dashboard.js          # Loads real user data from API
        │   ├── job_search.js         # Job search + apply
        │   ├── app_status.js         # Application tracking
        │   ├── profile.js            # Profile management
        │   ├── counselling.js        # Session booking
        │   ├── mentorship.js         # Mentorship enrollment
        │   └── feedback.js           # Feedback submission
        └── ...
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### Installation

```bash
git clone https://github.com/kaifgowani/Rajkaushal.git
cd Rajkaushal
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_session_secret_key
PORT=3000
```

### Run Locally

```bash
node index.js
```

The server will start at `http://localhost:3000`. On first run:
- Sample jobs are seeded automatically
- A default admin account is created: `admin@rajkaushal.com`

---

## API Routes

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/jobs` | Public | Get jobs with optional filters |
| POST | `/api/apply` | Worker | Apply for a job |
| GET | `/api/applications/me` | Worker | Get own applications |
| GET | `/api/user/me` | Worker | Get own profile |
| PUT | `/api/user/me` | Worker | Update own profile |
| POST | `/api/counselling/book` | Worker | Book a counselling session |
| GET | `/api/counselling/my-sessions` | Worker | Get own sessions |
| POST | `/api/mentorship/enroll` | Worker | Enroll in mentorship |
| GET | `/api/mentorship/my-programs` | Worker | Get own programs |
| POST | `/api/feedback/submit` | Worker | Submit feedback |
| POST | `/api/employer/post-job` | Employer | Submit a job for approval |
| POST | `/api/admin/approve-job/:id` | Admin | Approve a pending job |
| DELETE | `/api/admin/reject-job/:id` | Admin | Reject and delete a job |

---

## License

MIT — Original frontend by the SIH 2024 Tech Titans team. Backend and completion by [@kaifgowani](https://github.com/kaifgowani).