import { query } from "./config/database.js";
import bcrypt from "bcryptjs";

const seedUsers = [
  ["StudyBuddy Demo User", "demo@studybuddy.local", "DemoPass123!"],
];

const seedTasks = [
  [
    "Finish math homework",
    "Complete chapters 3 and 4 practice problems before class.",
    "2026-05-10",
    "high",
    "pending",
    1,
  ],
  [
    "Review biology notes",
    "Summarize cell respiration notes and prepare flashcards.",
    "2026-05-12",
    "medium",
    "pending",
    1,
  ],
  [
    "History essay outline",
    "Draft an outline for the World War II research essay.",
    "2026-05-15",
    "low",
    "pending",
    1,
  ],
];

const seedTags = [
  ["urgent", "#ef4444", 1],
  ["study", "#6366f1", 1],
  ["homework", "#f97316", 1],
];

// task index → tag indexes to assign
const seedTaskTags = [
  [1, 1], // task 1 → tag "urgent"
  [1, 3], // task 1 → tag "homework"
  [2, 2], // task 2 → tag "study"
  [3, 2], // task 3 → tag "study"
];

async function resetDatabase() {
  // Drop in reverse dependency order
  await query("DROP TABLE IF EXISTS task_tags");
  await query("DROP TABLE IF EXISTS tags");
  await query("DROP TABLE IF EXISTS tasks");
  await query("DROP TABLE IF EXISTS users");

  // Create users
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      reset_token_hash VARCHAR(255),
      reset_token_expires_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create tasks
  await query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      due_date DATE NOT NULL,
      priority VARCHAR(20) NOT NULL DEFAULT 'medium',
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create tags
  await query(`
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create task_tags join table
  await query(`
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, tag_id)
    )
  `);

  // Seed users
  const passwordHash = await bcrypt.hash(seedUsers[0][2], 10);
  for (const [fullName, email] of seedUsers) {
    await query(
      `INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3)`,
      [fullName, email, passwordHash]
    );
  }

  // Seed tasks
  for (const [title, description, dueDate, priority, status, userId] of seedTasks) {
    await query(
      `INSERT INTO tasks (title, description, due_date, priority, status, user_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, description, dueDate, priority, status, userId]
    );
  }

  // Seed tags
  for (const [name, color, userId] of seedTags) {
    await query(
      `INSERT INTO tags (name, color) VALUES ($1, $2)`,
      [name, color]
    );
  }

  // Seed task_tags
  for (const [taskId, tagId] of seedTaskTags) {
    await query(
      `INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)`,
      [taskId, tagId]
    );
  }

  console.log("Database reset complete.");
}

resetDatabase()
  .catch((error) => {
    console.error("Database reset failed.", error);
    process.exitCode = 1;
  });
