import { useEffect, useState } from "react";

const PRIORITY_LABEL = { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" };
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function compareTasks(a, b, sortOrder) {
  switch (sortOrder) {
    case "priority-high-low":
      return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
    case "priority-low-high":
      return (PRIORITY_ORDER[b.priority] ?? 1) - (PRIORITY_ORDER[a.priority] ?? 1);
    case "deadline-soonest": {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return aTime - bTime;
    }
    case "deadline-overdue": {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : -Infinity;
      const bTime = b.deadline ? new Date(b.deadline).getTime() : -Infinity;
      return bTime - aTime;
    }
    case "title-az":
      return (a.title || "").localeCompare(b.title || "");
    case "title-za":
      return (b.title || "").localeCompare(a.title || "");
    default:
      return 0;
  }
}

function getDeadlineTimestamp(deadline) {
  if (!deadline) {
    return null;
  }

  const deadlineDate = new Date(`${deadline}T23:59:59`);
  return Number.isNaN(deadlineDate.getTime()) ? null : deadlineDate.getTime();
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const segments = [];

  if (days > 0) {
    segments.push(`${days}d`);
  }

  segments.push(`${String(hours).padStart(2, "0")}h`);
  segments.push(`${String(minutes).padStart(2, "0")}m`);
  segments.push(`${String(seconds).padStart(2, "0")}s`);

  return segments.join(" ");
}

function getCountdownState(deadline, now) {
  const deadlineTimestamp = getDeadlineTimestamp(deadline);

  if (!deadlineTimestamp) {
    return {
      isExpired: false,
      label: "Timer unavailable",
    };
  }

  const remainingMilliseconds = deadlineTimestamp - now;

  if (remainingMilliseconds < 0) {
    return {
      isExpired: true,
      label: `Lapsed by ${formatDuration(Math.abs(remainingMilliseconds))}`,
    };
  }

  return {
    isExpired: false,
    label: `${formatDuration(remainingMilliseconds)} left`,
  };
}

function TaskList({
  errorMessage,
  isLoading,
  onDeleteTask,
  onEditTask,
  onToggleComplete,
  tasks,
  user,
  searchQuery,
}) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const filtered = tasks.filter((t) => {
    const statusOk =
      filterStatus === "all" ||
      (filterStatus === "completed" ? t.completed : !t.completed);
    const priorityOk =
      filterPriority === "all" || t.priority === filterPriority;
    const searchOk =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return statusOk && priorityOk && searchOk;
  });

  const sorted =
    sortOrder === "none"
      ? filtered
      : [...filtered].sort((a, b) => compareTasks(a, b, sortOrder));

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const handleDelete = (taskId, taskTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${taskTitle}"?`,
    );
    if (confirmed) onDeleteTask(taskId);
  };

  const handleEdit = (task) => {
    const confirmed = window.confirm(`Edit "${task.title}"?`);
    if (confirmed) onEditTask(task);
  };

  return (
    <section className="task-list-section">
      <div className="task-list-header">
        <div>
          <h2>Task List</h2>
          <p className="form-note">Signed in as {user.email}</p>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="progress-bar-container">
          <p className="progress-label">
            {completedCount}/{tasks.length} completed ({progress}%)
          </p>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="filter-bar">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="none">Sort By</option>
          <option value="priority-high-low">Priority (High → Low)</option>
          <option value="priority-low-high">Priority (Low → High)</option>
          <option value="deadline-soonest">Deadline (Soonest → Overdue)</option>
          <option value="deadline-overdue">Deadline (Overdue → Soonest)</option>
          <option value="title-az">Title (A → Z)</option>
          <option value="title-za">Title (Z → A)</option>
        </select>
      </div>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {isLoading ? <p className="empty-message">Loading tasks...</p> : null}
      {!isLoading && sorted.length === 0 ? (
        <p className="empty-message">No tasks found.</p>
      ) : (
        <div className="task-list">
          {sorted.map((task) => {
            const countdown = getCountdownState(task.deadline, currentTime);

            return (
              <div
                className={`task-card ${task.completed ? "task-completed" : ""}`}
                key={task.id}
              >
                <div className="task-card-header">
                  <h3>{task.title}</h3>
                  <span className={`priority-badge priority-${task.priority}`}>
                    {PRIORITY_LABEL[task.priority] || task.priority}
                  </span>
                </div>
                <p>
                  <strong>Description:</strong> {task.description || task.subject}
                </p>
                <p>
                  <strong>Deadline:</strong> {task.deadline}
                </p>
                <p
                  className={`task-timer ${countdown.isExpired ? "task-timer-expired" : ""}`}
                >
                  <strong>Time Remaining:</strong> {countdown.label}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {task.completed ? "✅ Completed" : "⏳ Pending"}
                </p>
                <div className="task-card-actions">
                  <button type="button" onClick={() => onToggleComplete(task)}>
                    {task.completed ? "Mark Pending" : "Mark Complete"}
                  </button>
                  <button type="button" onClick={() => handleEdit(task)}>
                    Edit
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleDelete(task.id, task.title)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default TaskList;
