# StudyBuddy Planner

CodePath WEB103 Final Project

Designed and developed by: Group 2 - Web 103 Final Project

🔗 Link to deployed app: https://studybuddyplanner.vercel.app/

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

Database: PostgreSQL

Deployment: Vercel

## Features

- ✅ **Create a new task** – users can add a study task with a title and due date

  ![Demo](./planning/images/milestone3-demo.gif)

- ❌ **Edit a task** – users can update existing task information
  [gif goes here]
- ❌ **Delete a task** – users can remove tasks they no longer need
  [gif goes here]
- ❌ **Mark task as completed** – users can track finished work
  [gif goes here]
- ❌ **Assign priority levels** – users can label tasks as high, medium, or low priority
  [gif goes here]
- **Filter tasks by priority or status** – users can focus on specific tasks
  [gif goes here]
- ❌ **Track completion progress** – users can monitor their overall study progress
  [gif goes here]

### Additional Possible Features

- **User Authentication**: Secure login/register to allow personalized, private task management across sessions.
  [gif goes here]
- **Search Functionality**: Quickly find tasks by keywords or dates, useful for students managing large lists.
  [gif goes here]
- **Recurring Tasks**: Set tasks to repeat automatically (e.g., daily reviews), reducing manual effort for routine studies.
  [gif goes here]
- **Reminders and Notifications**: Get alerts for due dates via email or in-app, helping prevent missed deadlines.
  [gif goes here]
- **Dark Mode**: Switch themes for comfortable use during late-night studying.
  [gif goes here]
- **Mobile Responsiveness/PWA**: Access offline and install like an app for on-the-go task checking.
  [gif goes here]

## Installation Instructions

1. Clone the repository:
   git clone <your-repo-url>

2. Navigate into the project folder:
   cd <repo-name>

3. Create your environment file:
  Copy `.env.example` to `.env` and replace the placeholder values.
  Example JWT secret format:
  `JWT_SECRET="replace-with-a-long-random-secret-like-studybuddy-2026-dev-secret-key"`
  For password reset emails, configure the SMTP settings in `.env`.
  If SMTP is not configured, the app returns a development preview reset link instead.

4. Install frontend dependencies:
   cd client
   npm install

5. Install backend dependencies:
   cd ../server
   npm install

6. Start the frontend and backend servers:
  Frontend: `cd client && npm run dev`
  Backend: `cd server && npm start`

## Vercel Deployment

1. Import the repository into Vercel with the project root set to `web103_finalproject`.
2. Keep the default install command: `npm install`.
3. Keep the build command: `npm run build`.
4. Vercel will use `client/dist` as the output directory via `vercel.json`.
5. Add the environment variables from `.env` in Vercel project settings:
  `PGDATABASE`, `PGHOST`, `PGPASSWORD`, `PGPORT`, `PGUSER`, `PGSSLMODE`, `JWT_SECRET`, `APP_BASE_URL`, and any SMTP variables needed for production email delivery.
6. Redeploy after saving the environment variables.

Project structure and setup steps will be updated as development begins in later milestones.
