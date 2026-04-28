# StudyBuddy Planner

CodePath WEB103 Final Project

Designed and developed by: Group 2 - Web 103 Final Project

🔗 Link to deployed app: https://studybuddy-frontend-qmc6.onrender.com

## Group Members

- Thuan Nguyen
- Roel Crodua
- Thierry Laguerre

## About

StudyBuddy Planner is a simple and intuitive task management web application designed specifically for students. It helps users organize their academic responsibilities, prioritize tasks, and track their progress in one centralized platform.

### Description and Purpose

StudyBuddy Planner is a web application designed to help students manage their academic tasks, track deadlines, and prioritize their work efficiently.

The purpose of this app is to provide a simple and focused interface for organizing study tasks and improving productivity.

### Inspiration

This app is inspired by how students often use multiple tools like notes, reminders, and calendars to manage their tasks. StudyBuddy Planner simplifies this into one unified platform.

## Tech Stack

Frontend: React, React Router, CSS

Backend: Node.js, Express.js

Database: PostgreSQL (Neon)

Deployment: Render

## Features

📹 **Full demo of all features:**

![Full Demo](./planning/images/Final-demo.gif)

- ✅ **Create a new task** – users can add a study task with a title, description, priority, and due date
- ✅ **Edit a task** – users can update existing task information including title, description, deadline, and priority
- ✅ **Delete a task** – users can remove tasks they no longer need (with confirmation prompt)
- ✅ **Mark task as completed** – users can toggle tasks between Pending and Completed to track finished work
- ✅ **Assign priority levels** – users can label tasks as high, medium, or low priority when creating or editing
- ✅ **Filter tasks by priority or status** – users can focus on specific tasks using dropdown filters
- ✅ **Track completion progress** – users can monitor their overall study progress via a progress bar showing percentage of completed tasks
- ✅ **User Authentication** – secure login/register allows personalized, private task management across sessions
- ✅ **Search Functionality** – users can quickly find tasks by typing keywords in the search bar in the navigation header
- ✅ **Tags** – users can create color-coded tags and assign multiple tags to tasks for flexible organization (many-to-many relationship)
- ✅ **View Task Detail** – users can navigate to a dedicated page for each task showing full details via dynamic routes

### Additional Possible Features

- Recurring Tasks: Set tasks to repeat automatically (e.g., daily reviews), reducing manual effort for routine studies.
- Reminders and Notifications: Get alerts for due dates via email or in-app, helping prevent missed deadlines.
- Dark Mode: Switch themes for comfortable use during late-night studying.
- Mobile Responsiveness/PWA: Access offline and install like an app for on-the-go task checking.

## Installation Instructions

1. Clone the repository:

   ```
   git clone <your-repo-url>
   ```

2. Navigate into the project folder:

   ```
   cd web103_finalproject
   ```

3. Create your environment file — copy `.env.example` to `.env` and fill in your values:

   ```
   PORT=3001
   PGDATABASE=neondb
   PGHOST=your-neon-host
   PGPASSWORD=your-neon-password
   PGPORT=5432
   PGUSER=neondb_owner
   PGSSLMODE=require
   JWT_SECRET=your-jwt-secret
   ```

4. Install backend dependencies:

   ```
   cd server
   npm install
   ```

5. (Optional) Reset the database to its default state:

   ```
   node reset.js
   ```

6. Start the backend server:

   ```
   npm start
   ```

7. In a new terminal, install and start the frontend:
   ```
   cd client
   npm install
   npm run dev
   ```

## Render Deployment

- **Backend:** https://studybuddy-backend-ksac.onrender.com
- **Frontend:** https://studybuddy-frontend-qmc6.onrender.com
