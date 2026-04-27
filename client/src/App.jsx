import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TaskDetail from "./pages/TaskDetail";
import "./index.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const authStorageKey = "studybuddy-auth";
const themeStorageKey = "studybuddy-theme";

function getStoredSession() {
  const storedValue = window.localStorage.getItem(authStorageKey);
  if (!storedValue) return { token: "", user: null };
  try {
    const parsedValue = JSON.parse(storedValue);
    return {
      token: parsedValue?.token || "",
      user: parsedValue?.user || null,
    };
  } catch {
    return { token: "", user: null };
  }
}

function saveSession(token, user) {
  window.localStorage.setItem(authStorageKey, JSON.stringify({ token, user }));
}

function clearStoredSession() {
  window.localStorage.removeItem(authStorageKey);
}

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const storedTheme = window.localStorage.getItem(themeStorageKey);
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const initialUrl = new URL(window.location.href);
  const initialResetMode = initialUrl.searchParams.get("mode") === "reset";

  const [theme, setTheme] = useState(getInitialTheme);
  const [authMode, setAuthMode] = useState(initialResetMode ? "reset" : "login");
  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: initialUrl.searchParams.get("email") || "",
    password: "",
    confirmPassword: "",
    token: initialUrl.searchParams.get("token") || "",
  });
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [previewResetUrl, setPreviewResetUrl] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const isDarkTheme = theme === "dark";
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const renderThemeToggle = (className = "") => (
    <button
      className={["secondary-button", "theme-toggle", className].filter(Boolean).join(" ")}
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
      aria-pressed={isDarkTheme}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.25M12 19.25v2.25M21.5 12h-2.25M4.75 12H2.5M18.72 5.28l-1.6 1.59M6.88 17.12l-1.6 1.6M18.72 18.72l-1.6-1.6M6.88 6.88l-1.6-1.6" />
        </svg>
      </span>
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
        </svg>
      </span>
    </button>
  );

  const switchAuthMode = (nextMode) => {
    setAuthMode(nextMode);
    setAuthError("");
    setAuthMessage("");
    setPreviewResetUrl("");
    const url = new URL(window.location.href);
    if (nextMode === "reset") {
      url.searchParams.set("mode", "reset");
    } else {
      url.searchParams.delete("mode");
      url.searchParams.delete("token");
    }
    if (nextMode !== "reset") {
      url.searchParams.delete("email");
      setAuthForm((prev) => ({ ...prev, token: "" }));
    }
    window.history.replaceState({}, "", url);
  };

  const handleAuthInputChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setIsAuthenticating(true);
    setAuthError("");
    setAuthMessage("");
    setPreviewResetUrl("");

    try {
      const endpointByMode = {
        login: `${API_BASE}/api/auth/login`,
        signup: `${API_BASE}/api/auth/signup`,
        forgot: `${API_BASE}/api/auth/forgot-password`,
        reset: `${API_BASE}/api/auth/reset-password`,
      };

      const requestBodyByMode = {
        login: { email: authForm.email, password: authForm.password },
        signup: { fullName: authForm.fullName, email: authForm.email, password: authForm.password },
        forgot: { email: authForm.email },
        reset: { email: authForm.email, password: authForm.password, token: authForm.token },
      };

      if (authMode === "reset" && authForm.password !== authForm.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const response = await fetch(endpointByMode[authMode], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBodyByMode[authMode]),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Unable to ${authMode}.`);

      if (authMode === "forgot") {
        setAuthMessage(data.message || "If an account matches that email, a reset link has been sent.");
        setPreviewResetUrl(data.previewResetUrl || "");
        return;
      }

      if (authMode === "reset") {
        setAuthMessage(data.message || "Password updated successfully.");
        setAuthForm((prev) => ({ ...prev, password: "", confirmPassword: "", token: "" }));
        switchAuthMode("login");
        return;
      }

      saveSession(data.token, data.user);
      onLogin(data.token, data.user);
      navigate("/dashboard");
    } catch (error) {
      setAuthError(error.message || `Unable to ${authMode}.`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const isSignup = authMode === "signup";
  const isForgot = authMode === "forgot";
  const isReset = authMode === "reset";

  return (
    <div className="auth-shell">
      <div className="auth-toolbar">{renderThemeToggle()}</div>
      <section className="auth-showcase">
        <p className="auth-eyebrow">StudyBuddy Planner</p>
        <h1>Private study planning for every semester sprint.</h1>
        <p className="auth-subtitle">
          Create an account to keep your assignments, deadlines, and priorities tied to your own workspace.
        </p>
        <div className="auth-highlights">
          <div>
            <strong>Secure accounts</strong>
            <span>Tasks stay attached to the signed-in user.</span>
          </div>
          <div>
            <strong>Fast capture</strong>
            <span>Add classes, assignments, and deadlines in one flow.</span>
          </div>
          <div>
            <strong>Stay focused</strong>
            <span>Pick up where you left off with a saved session.</span>
          </div>
        </div>
      </section>

      <section className="auth-card">
        {!isForgot && !isReset ? (
          <div className="auth-tabs" role="tablist" aria-label="Authentication options">
            <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => switchAuthMode("login")}>Login</button>
            <button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => switchAuthMode("signup")}>Sign Up</button>
          </div>
        ) : null}

        <h2>
          {isSignup ? "Create your account" : isForgot ? "Reset your password" : isReset ? "Choose a new password" : "Welcome back"}
        </h2>
        <p className="form-note">
          {isSignup ? "Set up your planner account to keep tasks private and persistent."
            : isForgot ? "Enter your email and we will send you a reset link."
            : isReset ? "Set a new password for your account using the reset link you opened."
            : "Log in to view and manage your study tasks."}
        </p>

        <form className="task-form auth-form" onSubmit={handleAuthSubmit}>
          {isSignup ? (
            <input type="text" name="fullName" placeholder="Full name" value={authForm.fullName} onChange={handleAuthInputChange} required />
          ) : null}
          <input type="email" name="email" placeholder="Email address" value={authForm.email} onChange={handleAuthInputChange} readOnly={isReset} required />
          {!isForgot ? (
            <input type="password" name="password" placeholder={isReset ? "New password" : "Password"} value={authForm.password} onChange={handleAuthInputChange} minLength={8} required />
          ) : null}
          {isReset ? (
            <input type="password" name="confirmPassword" placeholder="Confirm new password" value={authForm.confirmPassword} onChange={handleAuthInputChange} required />
          ) : null}

          {authError ? <p className="form-error">{authError}</p> : null}
          {authMessage ? <p className="form-success">{authMessage}</p> : null}
          {previewResetUrl ? (
            <a className="auth-link-preview" href={previewResetUrl}>Open development reset link</a>
          ) : null}

          <button type="submit" disabled={isAuthenticating}>
            {isAuthenticating
              ? isSignup ? "Creating account..." : isForgot ? "Sending reset link..." : isReset ? "Updating password..." : "Signing in..."
              : isSignup ? "Create Account" : isForgot ? "Send Reset Link" : isReset ? "Save New Password" : "Log In"}
          </button>
        </form>

        <div className="auth-secondary-actions">
          {authMode === "login" ? (
            <button type="button" className="auth-link-button" onClick={() => switchAuthMode("forgot")}>Forgot password?</button>
          ) : null}
          {isForgot || isReset ? (
            <button type="button" className="auth-link-button" onClick={() => switchAuthMode("login")}>Back to login</button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function DashboardPage({ token, user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isMobileTaskFormOpen, setIsMobileTaskFormOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);
  const taskFormRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      const mobileViewport = window.innerWidth <= 768;
      setIsMobileViewport(mobileViewport);
      if (!mobileViewport) setIsMobileTaskFormOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await fetch(`${API_BASE}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) throw new Error("Your session has expired. Please log in again.");
        if (!response.ok) throw new Error("Unable to load tasks.");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        const message = error.message || "Unable to load tasks.";
        setErrorMessage(message);
        if (message.includes("session")) onLogout();
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, [token]);

  const isDarkTheme = theme === "dark";
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const renderThemeToggle = (className = "") => (
    <button
      className={["secondary-button", "theme-toggle", className].filter(Boolean).join(" ")}
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
      aria-pressed={isDarkTheme}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.25M12 19.25v2.25M21.5 12h-2.25M4.75 12H2.5M18.72 5.28l-1.6 1.59M6.88 17.12l-1.6 1.6M18.72 18.72l-1.6-1.6M6.88 6.88l-1.6-1.6" />
        </svg>
      </span>
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
        </svg>
      </span>
    </button>
  );

  const openTaskForm = (task = null) => {
    setEditingTask(task);
    if (isMobileViewport) {
      setIsMobileTaskFormOpen(true);
      return;
    }
    requestAnimationFrame(() => {
      taskFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closeMobileTaskForm = () => {
    setIsMobileTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleCreateTask = async (taskDetails) => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(taskDetails),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create task.");
      setTasks((prev) => [data, ...prev]);
      setIsMobileTaskFormOpen(false);
    } catch (error) {
      setErrorMessage(error.message || "Unable to create task.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTask = async (taskDetails) => {
    if (!editingTask) return;
    setIsSaving(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(taskDetails),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update task.");
      setTasks((prev) => prev.map((task) => (task.id === data.id ? data : task)));
      setEditingTask(null);
      setIsMobileTaskFormOpen(false);
    } catch (error) {
      setErrorMessage(error.message || "Unable to update task.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleComplete = async (task) => {
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          deadline: task.deadline,
          priority: task.priority,
          completed: !task.completed,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update task.");
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    } catch (error) {
      setErrorMessage(error.message || "Unable to update task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        let errorMessageFromServer = "Unable to delete task.";
        try {
          const data = await response.json();
          errorMessageFromServer = data.error || errorMessageFromServer;
        } catch { }
        throw new Error(errorMessageFromServer);
      }
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      if (editingTask?.id === taskId) {
        setEditingTask(null);
        setIsMobileTaskFormOpen(false);
      }
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete task.");
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <p className="auth-eyebrow">StudyBuddy Planner</p>
          <h1>{user.fullName.split(" ")[0]}'s Dashboard</h1>
          <p className="auth-subtitle">Plan your study tasks and keep them attached to your account.</p>
        </div>
        <div className="header-right">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {renderThemeToggle("header-button")}
          <button className="secondary-button header-button" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-layout">
        <div ref={taskFormRef} className="task-form-column">
          <TaskForm
            key={editingTask?.id || "new-task"}
            editingTask={editingTask}
            isSaving={isSaving}
            onCancelEdit={() => setEditingTask(null)}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
          />
        </div>
        <TaskList
          errorMessage={errorMessage}
          isLoading={isLoading}
          onDeleteTask={handleDeleteTask}
          onEditTask={openTaskForm}
          onToggleComplete={handleToggleComplete}
          tasks={tasks}
          user={user}
          searchQuery={searchQuery}
          onViewDetail={(task) => navigate(`/tasks/${task.id}`)}
        />
      </main>

      {isMobileTaskFormOpen ? (
        <div className="task-form-mobile-overlay" role="presentation">
          <div className="task-form-mobile-sheet">
            <TaskForm
              key={`mobile-${editingTask?.id || "new-task"}`}
              editingTask={editingTask}
              isSaving={isSaving}
              onCancelEdit={closeMobileTaskForm}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
            />
            <button className="secondary-button mobile-task-form-close" type="button" onClick={closeMobileTaskForm}>
              Close
            </button>
          </div>
        </div>
      ) : null}

      <button className="floating-new-task-button" type="button" onClick={() => openTaskForm()}>
        <span className="floating-new-task-button-icon" aria-hidden="true">+</span>
        <span>New Task</span>
      </button>
    </div>
  );
}

function App() {
  const [{ token: storedToken, user: storedUser }] = useState(getStoredSession);
  const [token, setToken] = useState(storedToken);
  const [user, setUser] = useState(storedUser);
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(storedToken));

  useEffect(() => {
    const restoreSession = async () => {
      if (!storedToken) {
        setIsCheckingSession(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (!response.ok) throw new Error("Session expired.");
        const data = await response.json();
        setUser(data.user);
        saveSession(storedToken, data.user);
      } catch {
        clearStoredSession();
        setToken("");
        setUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    };
    restoreSession();
  }, [storedToken]);

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    clearStoredSession();
    setToken("");
    setUser(null);
  };

  if (isCheckingSession) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="auth-eyebrow">StudyBuddy Planner</p>
          <h1>Restoring your workspace</h1>
          <p className="auth-subtitle">Checking your saved session.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={token && user ? <Navigate to="/dashboard" replace /> : <AuthPage onLogin={handleLogin} />}
      />
      <Route
        path="/dashboard"
        element={token && user ? <DashboardPage token={token} user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/tasks/:id"
        element={token && user
          ? <TaskDetail token={token} onDeleteTask={async (id) => { await fetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); }} onToggleComplete={async () => {}} />
          : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
