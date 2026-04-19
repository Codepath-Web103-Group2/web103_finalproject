import { useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./index.css";

function App() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Finish math homework",
      subject: "Math",
      deadline: "2026-04-20",
      completed: false,
      priority:"Medium"
    },
    {
      id: 2,
      title: "Review biology notes",
      subject: "Biology",
      deadline: "2026-04-21",
      completed: false,
      priority:"Medium"

    },
  ]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all'); 
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const handleAddTask = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleTaskCompleted = (id) => {
    setTasks(tasks.map((task) => task.id === id ? {...task, completed:!task.completed } : task))
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = 
      statusFilter === 'all' ? true : 
      statusFilter === 'completed' ? task.completed : !task.completed;
  
    const matchesPriority = 
      priorityFilter === 'all' ? true : task.priority === priorityFilter;
  
    return matchesStatus && matchesPriority;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>StudyBuddy Planner</h1>
        <p>Plan your study tasks and stay organized.</p>
        <section className="progress-section">
        <div className="progress-header">
          <h2>Your Progress</h2>
          <span className="progress-stats">{completedTasks} of {totalTasks} tasks done</span>
        </div>
  
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <p className="progress-label">{progressPercentage}% Complete</p>
      </section>
      </header>
      <div className="filter-controls">
        <select onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        <select onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <main className="main-layout">
        <TaskForm onAddTask={handleAddTask} />
        <TaskList tasks={filteredTasks} handleTaskCompleted={handleTaskCompleted} />
        </main>
    </div>
  );
}

export default App;
