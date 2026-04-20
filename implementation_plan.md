# Student Notes Sharing App

This document outlines the implementation plan for building a modern "Student Notes Sharing App" using the MERN stack. The project will be divided into two main domains: `/backend` and `/frontend`.

## User Review Required

> [!IMPORTANT]
> The user requested to pause after creating the backend models and server setup for confirmation. Therefore, the execution of this plan will be split into phases, and I will explicitly ask for permission to begin the frontend implementation after the backend foundation is established.

## Proposed Changes

### Backend Setup

#### [NEW] backend/package.json
Initialize a new Node.js project for the backend, configuring basic scripts and installing dependencies (express, mongoose, dotenv, cors, jsonwebtoken, bcryptjs, multer).

#### [NEW] backend/server.js
Setup Express app, configure basic middleware (CORS, JSON parsing), load environment variables, and connect to MongoDB.

#### [NEW] backend/.env
A sample file containing required environment variables (e.g., `PORT=5000`, `MONGO_URI`, `JWT_SECRET`).

---

### Backend Models (Mongoose)

#### [NEW] backend/models/User.js
Mongoose schema for Users (`name`, `email`, `password`, `role`). Will include a pre-save hook to hash passwords using `bcryptjs`.

#### [NEW] backend/models/Note.js
Mongoose schema for Notes (`title`, `subject`, `topic`, `fileUrl`, `uploadedBy`, `status`, `createdAt`).

#### [NEW] backend/models/Comment.js
Mongoose schema for Comments (`noteId`, `userId`, `commentText`, `createdAt`).

#### [NEW] backend/models/Like.js
Mongoose schema for Likes (`noteId`, `userId`).

#### [NEW] backend/models/SavedNote.js
Mongoose schema for Saved Notes (`userId`, `noteId`).

---

### Backend Middleware & Routes

#### [NEW] backend/middleware/authMiddleware.js
Middleware to protect routes by verifying JWT. Also includes an `adminMiddleware` for role-based access control.

#### [NEW] backend/routes/authRoutes.js
Routes for `/api/auth/register` and `/api/auth/login`. Let's abstract the logic to a controller if needed, or inline for brevity.

#### [NEW] backend/routes/noteRoutes.js
Routes for fetching, uploading (mock file storage initially or local multer), and managing notes.

#### [NEW] backend/routes/interactionRoutes.js
Routes for liking, saving, and adding comments to a specific note.

#### [NEW] backend/routes/adminRoutes.js
Routes specifically designed for admin actions (view all users, delete any note), protected by both `auth` and `admin` middleware.

---

### Frontend Setup

*(To be executed after explicit confirmation of backend)*

#### [NEW] frontend/
A Vite React application (`npx create-vite-app@latest ./frontend`) structured with Tailwind CSS (`index.css`, `tailwind.config.js`).

#### [NEW] frontend/src/context/AuthContext.jsx
React Context wrapper to manage user state/session globally across the app based on JWT.

#### [NEW] frontend/src/App.jsx & Routing
Setup `react-router-dom` incorporating public routes (Login/Register), protected student routes (Feed, Dashboard, Upload), and protected admin routes (Admin Dashboard).

#### [NEW] frontend/src/components/...
Shared components for layouts (Navbar), Note Cards, forms, etc.

## Open Questions

> [!WARNING]
> 1. **File Upload Handling:** For uploading notes, would you prefer a simple local file upload setup utilizing `multer` saving directly to a `backend/uploads` directory, or simulate/mock the file URL (string entry)?
> 2. **Authentication Flow:** Should the token be saved inside a secure `HttpOnly` cookie or simply returned in the response json to be stored in the frontend's `localStorage`? (LocalStorage is easier to setup and is suitable for most standard demo projects).

## Verification Plan

### Automated Tests
- Build and verify server setup successfully launches without runtime errors.
- Confirm backend API endpoints return appropriate JSON structures using mock test requests.

### Manual Verification
- Initialize `npm run dev` for both frontend and backend.
- Manually run through the Register -> Login -> Note Upload -> User Dashboard flow to ensure features match the specification.
- Log in with an `admin` role account to verify restricted admin routes.
