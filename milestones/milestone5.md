# Milestone 5

This document should be completed and submitted during **Unit 9** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] Deploy your project on Render
  - [x] In `readme.md`, add the link to your deployed project
- [x] Update the status of issues in your project board as you complete them
- [x] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of their title
  - [x] Under each feature you have completed, **include a GIF** showing feature functionality
- [x] In this document, complete the **Reflection** section below
- [x] 🚩🚩🚩**Complete the Final Project Feature Checklist section below**, detailing each feature you completed in the project (ONLY include features you implemented, not features you planned)
- [x] 🚩🚩🚩**Record a GIF showing a complete run-through of your app** that displays all the components included in the **Final Project Feature Checklist** below
  - [x] Include this GIF in the **Final Demo GIF** section below

## Final Project Feature Checklist

Complete the checklist below detailing each baseline, custom, and stretch feature you completed in your project. This checklist will help graders look for each feature in the GIF you submit.

### Baseline Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [x] The project includes an Express backend app and a React frontend app
- [x] The project includes these backend-specific features:
  - [x] At least one of each of the following database relationships in Postgres
    - [x] one-to-many
    - [x] many-to-many with a join table
  - [x] A well-designed RESTful API that:
    - [x] supports all four main request types for a single entity (ex. tasks in a to-do list app): GET, POST, PATCH, and DELETE
      - [x] the user can **view** items, such as tasks
      - [x] the user can **create** a new item, such as a task
      - [x] the user can **update** an existing item by changing some or all of its values, such as changing the title of task
      - [x] the user can **delete** an existing item, such as a task
    - [x] Routes follow proper naming conventions
  - [x] The web app includes the ability to reset the database to its default state
- [x] The project includes these frontend-specific features:
  - [x] At least one redirection, where users are able to navigate to a new page with a new URL within the app
  - [x] At least one interaction that the user can initiate and complete on the same page without navigating to a new page
  - [x] Dynamic frontend routes created with React Router
  - [x] Hierarchically designed React components
    - [x] Components broken down into categories, including Page and Component types
    - [x] Corresponding container components and presenter components as appropriate
- [x] The project includes dynamic routes for both frontend and backend apps
- [x] The project is deployed on Render with all pages and features that are visible to the user are working as intended

### Custom Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [x] The project gracefully handles errors
- [ ] The project includes a one-to-one database relationship
- [ ] The project includes a slide-out pane or modal as appropriate for your use case that pops up and covers the page content without navigating away from the current page
- [ ] The project includes a unique field within the join table
- [ ] The project includes a custom non-RESTful route with corresponding controller actions
- [x] The user can filter or sort items based on particular criteria as appropriate for your use case
- [ ] Data is automatically generated in response to a certain event or user action. Examples include generating a default inventory for a new user starting a game or creating a starter set of tasks for a user creating a new task app account
- [x] Data submitted via a POST or PATCH request is validated before the database is updated (e.g. validating that an event is in the future before allowing a new event to be created)

### Stretch Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [x] A subset of pages require the user to log in before accessing the content
  - [ ] Users can log in and log out via GitHub OAuth with Passport.js
- [ ] Restrict available user options dynamically, such as restricting available purchases based on a user's currency
- [ ] Show a spinner while a page or page element is loading
- [ ] Disable buttons and inputs during the form submission process
- [ ] Disable buttons after they have been clicked
- [ ] Users can upload images to the app and have them be stored on a cloud service
- [ ] 🍞 Toast messages deliver simple feedback in response to user events

## Final Demo GIF

🔗 [Here's a GIF walkthrough of the final project](../planning/images/Final-demo.gif)

## Reflection

### 1. What went well during this unit?

Deployment to Render went smoothly once we correctly configured the environment variables. Both the backend web service and the frontend static site were successfully deployed and connected. We also completed the many-to-many tags feature, allowing users to create, assign, and remove tags on tasks, which added meaningful functionality to the app. The team communicated well throughout the unit and was able to resolve issues quickly by working together.

### 2. What were some challenges your group faced in this unit?

The most significant challenge we encountered was a double `/api` URL bug in the deployed frontend. Our `VITE_API_BASE_URL` environment variable was set to include `/api` at the end, while the frontend code was also appending `/api` to every request — resulting in requests being sent to `/api/api/auth/login` instead of `/api/auth/login`. This caused all API calls to fail in production even though everything worked locally. Tracing this bug required careful inspection of the Network tab in DevTools and a systematic review of how the base URL was being constructed throughout the codebase.

### 3. What were some of the highlights or achievements that you are most proud of in this project?

We are most proud of delivering a complete full-stack application that includes user authentication, a many-to-many relationship between tasks and tags, dynamic routing with React Router, and a live deployed version on Render. Building the tags system from scratch — including the database schema, API routes, and interactive UI — was particularly rewarding. Seeing the app work end-to-end in production, with real users able to register, log in, manage their tasks, and organize them with color-coded tags, felt like a significant accomplishment for our team.

### 4. Reflecting on your web development journey so far, how have you grown since the beginning of the course?

Since the beginning of the course, we have grown considerably in our ability to build and connect full-stack applications. Early on, working with Express routes and PostgreSQL queries felt unfamiliar, but over time we became more comfortable designing RESTful APIs, managing database relationships, and debugging server-side issues. On the frontend, we improved our understanding of React component architecture, state management, and how to consume APIs effectively. Deploying to a cloud platform and troubleshooting production-specific bugs also gave us practical experience that goes beyond what can be learned in a classroom setting alone.

### 5. Looking ahead, what are your goals related to web development, and what steps do you plan to take to achieve them?

Going forward, we aim to deepen our skills in building production-ready web applications. Specific goals include learning TypeScript to write more reliable code, exploring more advanced React patterns such as custom hooks and context, and improving our understanding of deployment pipelines and CI/CD workflows. We also plan to work on personal projects that involve more complex database designs and third-party API integrations. Taking on internships or contributing to open-source projects are concrete next steps we plan to pursue to continue growing as developers.
