import { useState,useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


import './styles.css';
import SupervisorTasks from './SupervisorTasks';

// Import dummy data for the tasks
const DUMMY_TASKS = [
  { id: 1, title: 'Complete UI design', assignee: 'John Doe', status: 'In Progress', dueDate: '2025-04-10', priority: 'High' },
  { id: 2, title: 'Implement authentication', assignee: 'Sarah Smith', status: 'Pending', dueDate: '2025-04-15', priority: 'High' },
  { id: 3, title: 'Create API endpoints', assignee: 'Mike Johnson', status: 'Completed', dueDate: '2025-04-05', priority: 'Medium' },
  { id: 4, title: 'Test responsive design', assignee: 'Emily Brown', status: 'In Progress', dueDate: '2025-04-12', priority: 'Low' },
  { id: 5, title: 'Update documentation', assignee: 'John Doe', status: 'Completed', dueDate: '2025-04-03', priority: 'Medium' },
  { id: 6, title: 'Code review', assignee: 'Sarah Smith', status: 'Pending', dueDate: '2025-04-18', priority: 'Medium' },
];

// Dummy team members data
const TEAM_MEMBERS = [
  { id: 1, name: 'John Doe', role: 'Frontend Developer', email: 'john@example.com', tasks: 2 },
  { id: 2, name: 'Sarah Smith', role: 'Backend Developer', email: 'sarah@example.com', tasks: 2 },
  { id: 3, name: 'Mike Johnson', role: 'UI/UX Designer', email: 'mike@example.com', tasks: 1 },
  { id: 4, name: 'Emily Brown', role: 'Project Manager', email: 'emily@example.com', tasks: 1 },
];

function Dashboard() {

    const navigate = useNavigate();
    const [decoded, setDecoded] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            const token = localStorage.getItem("token");
            
            if (!token) {
                alert("You must be logged in to view this page.");
                navigate("/login"); // Redirect to login page
                return;
            }
            
            
            try {
                const response = await fetch("http://localhost:5000/dashboard", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const data = await response.json();

                if (response.ok) {
                    
                    // alert(data.message);
                    const decodetoken = jwtDecode(token);
                    console.log(decodetoken.userId);
                    setDecoded(decodetoken);
                    navigate("/dashboard");
                } else {
                    alert(data.error);
                    navigate("/login"); // Redirect if token is invalid
                }
            } catch (error) {
                console.error("Error fetching dashboard:", error);
            }
        };

        fetchDashboard();
    }, [navigate]);


  const [activePage, setActivePage] = useState('dashboard');
  const [tasks, setTasks] = useState(DUMMY_TASKS);
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    status: 'Pending',
    dueDate: '',
    priority: 'Medium'
  });
  const [newUser, setNewUser] = useState({
    name: '',
    role: '',
    email: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'assigned', label: 'Assigned Tasks', icon: '📋' },
    { id: 'status', label: 'Status', icon: '📊' },
    { id: 'contact', label: 'Developer Contact', icon: '📞' },
  ];

  // Task status counts for dashboard and status page
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'Completed').length,
    inProgress: tasks.filter(task => task.status === 'In Progress').length,
    pending: tasks.filter(task => task.status === 'Pending').length
  };

  // Handle new task submission
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    
    // Create new task with unique ID
    const newTaskWithId = {
      ...newTask,
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1
    };
    
    setTasks([...tasks, newTaskWithId]);
    
    // Reset form
    setNewTask({
      title: '',
      assignee: '',
      status: 'Pending',
      dueDate: '',
      priority: 'Medium'
    });
    
    // Show success message or notification (could be enhanced with a proper notification system)
    alert('Task added successfully!');
  };

  // Handle new user submission
  const handleUserSubmit = (e) => {
    e.preventDefault();
    // This would typically connect to an API to create a new user
    // For demonstration purposes, we'll just show an alert
    alert(`User ${newUser.name} added successfully!`);
    
    // Reset form
    setNewUser({
      name: '',
      role: '',
      email: ''
    });
  };

  // Filter tasks based on search term and status filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Helper function for task status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-progress';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  };

  // Helper function for priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>TASK ALLOCATION</h1>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="main-container">
        {/* Header */}
        <header className="main-header">
          <h2>Task Management System</h2>
          <div className="user-info">
            <span className="user-greeting">Welcome, {decoded?.userId ? decoded.userId : "Admomn"}!</span>
            <div className="user-avatar">👤</div>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content">
          {/* Dashboard */}
          {activePage === 'dashboard' && (
            <div className="content-card">
              <h2 className="content-title">Welcome to the Task Allocation Dashboard</h2>
              <p className="content-subtitle">Overview of your task management system</p>
              
              <div className="dashboard-grid">
                <DashboardCard 
                  title="Tasks Assigned" 
                  value={taskStats.total.toString()} 
                  icon="📋" 
                  colorClass="blue"
                />
                <DashboardCard 
                  title="Team Members" 
                  value={TEAM_MEMBERS.length.toString()} 
                  icon="👥" 
                  colorClass="green"
                />
                <DashboardCard 
                  title="Completed Tasks" 
                  value={taskStats.completed.toString()} 
                  icon="✅" 
                  colorClass="purple"
                />
              </div>

              <div className="recent-tasks">
                <h3>Recent Tasks</h3>
                <div className="table-container">
                  <table className="task-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Assignee</th>
                        <th>Status</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.slice(0, 3).map(task => (
                        <tr key={task.id}>
                          <td>{task.title}</td>
                          <td>{task.assignee}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td>{task.dueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Assigned Tasks */}
          {activePage === 'assigned' && (
            <SupervisorTasks />
          )}
          
          {/* Status Overview */}
          {activePage === 'status' && (
            <div className="content-card">
              <h2 className="content-title">Task Status Overview</h2>
              <p className="content-subtitle">Current status of all tasks in the system</p>
              
              <div className="status-grid">
                <StatusCard 
                  title="Total Tasks" 
                  value={taskStats.total} 
                  icon="📊" 
                  colorClass="status-total"
                />
                <StatusCard 
                  title="Completed" 
                  value={taskStats.completed} 
                  icon="✅" 
                  colorClass="status-completed"
                />
                <StatusCard 
                  title="In Progress" 
                  value={taskStats.inProgress} 
                  icon="🔄" 
                  colorClass="status-progress"
                />
                <StatusCard 
                  title="Pending" 
                  value={taskStats.pending} 
                  icon="⏳" 
                  colorClass="status-pending"
                />
              </div>
              
              <div className="progress-container">
                <h3>Completion Progress</h3>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{width: `${(taskStats.completed / taskStats.total) * 100}%`}}
                  ></div>
                </div>
                <p className="progress-text">
                  {Math.round((taskStats.completed / taskStats.total) * 100)}% Complete
                  ({taskStats.completed} of {taskStats.total} tasks)
                </p>
              </div>
            </div>
          )}
          
          {/* Developer Contact */}
          {activePage === 'contact' && (
            <div className="content-card">
              <h2 className="content-title">Developer Contact</h2>
              <p className="content-subtitle">Get in touch with our development team</p>
              
              <div className="contact-container">
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <span className="contact-text">support@taskallocation.com</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <span className="contact-text">+1 (555) 123-4567</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">🌐</span>
                    <span className="contact-text">www.taskallocation.com</span>
                  </div>
                </div>
                
                <form className="contact-form">
                  <h3>Send us a message</h3>
                  <div className="form-group">
                    <label>Subject</label>
                    <input type="text" placeholder="What's this about?" />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea placeholder="Type your message here..."></textarea>
                  </div>
                  <button type="submit" className="submit-btn">Send Message</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Dashboard card component
function DashboardCard({ title, value, icon, colorClass }) {
  return (
    <div className={`dashboard-card ${colorClass}`}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  )
}

// Status card component for status page
function StatusCard({ title, value, icon, colorClass }) {
  return (
    <div className={`status-card ${colorClass}`}>
      <div className="status-icon">{icon}</div>
      <div className="status-content">
        <h3 className="status-title">{title}</h3>
        <p className="status-value">{value}</p>
      </div>
    </div>
  )
}

export default Dashboard