import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./index.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setErrorMessage("");
        const response = await fetch("/api/tasks");

        if (!response.ok) {
          throw new Error("Unable to load tasks.");
        }

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load tasks.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleCreateTask = async (taskDetails) => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create task.");
      }

      setTasks((prev) => [data, ...prev]);
    } catch (error) {
      setErrorMessage(error.message || "Unable to create task.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTask = async (taskDetails) => {
    if (!editingTask) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update task.");
      }

      setTasks((prev) => prev.map((task) => (task.id === data.id ? data : task)));
      setEditingTask(null);
    } catch (error) {
      setErrorMessage(error.message || "Unable to update task.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setErrorMessage("");

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessageFromServer = "Unable to delete task.";

        try {
          const data = await response.json();
          errorMessageFromServer = data.error || errorMessageFromServer;
        } catch {
          // Ignore non-JSON delete responses.
        }

        throw new Error(errorMessageFromServer);
      }

      setTasks((prev) => prev.filter((task) => task.id !== taskId));

      if (editingTask?.id === taskId) {
        setEditingTask(null);
      }
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete task.");
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>StudyBuddy Planner</h1>
        <p>Plan your study tasks and stay organized.</p>
      </header>

      <main className="main-layout">
        <TaskForm
          editingTask={editingTask}
          isSaving={isSaving}
          onCancelEdit={() => setEditingTask(null)}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
        />
        <TaskList
          errorMessage={errorMessage}
          isLoading={isLoading}
          onDeleteTask={handleDeleteTask}
          onEditTask={setEditingTask}
          tasks={tasks}
        />
      </main>
    </div>
  );
}

export default App;
