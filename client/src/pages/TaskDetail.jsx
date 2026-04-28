import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const PRIORITY_LABEL = { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" };

function TaskDetail({ token, onDeleteTask, onToggleComplete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Task not found.");
        const data = await response.json();
        setTask(data);
      } catch (err) {
        setError(err.message || "Unable to load task.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [id, token]);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${task.title}"?`);
    if (!confirmed) return;
    await onDeleteTask(task.id);
    navigate("/dashboard");
  };

  const handleToggle = async () => {
    await onToggleComplete(task);
    setTask((prev) => ({ ...prev, completed: !prev.completed }));
  };

  if (isLoading) return (
    <div className="auth-shell">
      <p className="empty-message">Loading task...</p>
    </div>
  );

  if (error) return (
    <div className="auth-shell">
      <p className="form-error">{error}</p>
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <p className="auth-eyebrow">StudyBuddy Planner</p>
          <h1>Task Detail</h1>
        </div>
        <div className="header-right">
          <button
            className="secondary-button header-button"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main style={{ padding: "2rem", maxWidth: "640px", margin: "0 auto" }}>
        <div className="task-card" style={{ padding: "2rem" }}>
          <div className="task-card-header">
            <h2>{task.title}</h2>
            <span className={`priority-badge priority-${task.priority}`}>
              {PRIORITY_LABEL[task.priority] || task.priority}
            </span>
          </div>

          <p style={{ margin: "1rem 0" }}>
            <strong>Description:</strong> {task.description}
          </p>
          <p>
            <strong>Deadline:</strong> {task.deadline}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {task.completed ? "✅ Completed" : "⏳ Pending"}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(task.created_at).toLocaleDateString()}
          </p>

          <div className="task-card-actions" style={{ marginTop: "1.5rem" }}>
            <button type="button" onClick={handleToggle}>
              {task.completed ? "Mark Pending" : "Mark Complete"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TaskDetail;
