import { useState,useEffect, use } from 'react';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


import './styles.css';
import SupervisorTasks from './SupervisorTasks';

function Dashboard() {

    const navigate = useNavigate();
    const [decoded, setDecoded] = useState(null);
    const [clientCount , setClientCount] = useState(0);
    const [totalClient , settotalClient] = useState(0);
    const [completedTask , setcompletedTask] = useState(0);
    const [pendingTask , setpendingTask] = useState(0);
    const [ongoingTask , setongoingTask] = useState(0);
    const [totalTask,setTotalTask] = useState(0);
    const [Tasks , setTasks] = useState([]);
    
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

    useEffect(()=>
    {
        async function fetchUser()
        {
            try {
                const response = await fetch("http://localhost:5000/client", {
                    method: "GET",
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
        
                const data = await response.json(); // Convert response to JSON
                // console.log(data);
                if ( data) {
                    // console.log(data)
                    setClientCount(data.Clients);
                    settotalClient(data.totalClients);
                    setcompletedTask(data.completedTask);
                    setongoingTask(data.ongoingTask);
                    setpendingTask(data.pendingTask);
                    setTotalTask(data.totalTask);

                    console.log("my client ",clientCount);
                } else {
                    console.error("Invalid data.count value:", data.count);
                    setClientCount(0); // Set default to prevent errors
                }

            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        }

        fetchUser();
    }, [])

     useEffect(() => {
        fetch("http://localhost:5000/tasks")
          .then((res) => res.json())
          .then((data) => {
            console.log("Fetched tasks:", data);
            setTasks(data);
          })
          .catch((err) => console.error("Error fetching tasks:", err));
      }, []);

  const [activePage, setActivePage] = useState('dashboard');
 

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'assigned', label: 'Assigned Tasks', icon: '📋' },
    { id: 'status', label: 'Status', icon: '📊' },
    { id: 'contact', label: 'Developer Contact', icon: '📞' },
  ];






  // Helper function for task status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-progress';
      case 'Pending': return 'status-pending';
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
                  value={clientCount || 0} 
                  icon="📋" 
                  colorClass="blue"
                />
                <DashboardCard 
                  title="Team Members" 
                  value={totalClient || 0} 
                  icon="👥" 
                  colorClass="green"
                />
                <DashboardCard 
                  title="Completed Tasks" 
                  value={completedTask} 
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
                      {Tasks.slice(0, 3).map(task => (
                        <tr key={task.id}>
                          <td>{task.title}</td>
                          <td>{task.description}</td>
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
                  value={totalTask} 
                  icon="📊" 
                  colorClass="status-total"
                />
                <StatusCard 
                  title="Completed" 
                  value={completedTask} 
                  icon="✅" 
                  colorClass="status-completed"
                />
                <StatusCard 
                  title="In Progress" 
                  value={ongoingTask} 
                  icon="🔄" 
                  colorClass="status-progress"
                />
                <StatusCard 
                  title="Pending" 
                  value={pendingTask} 
                  icon="⏳" 
                  colorClass="status-pending"
                />
              </div>
              
              <div className="progress-container">
                <h3>Completion Progress</h3>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{width: `${(completedTask / totalTask) * 100}%`}}
                  ></div>
                </div>
                <p className="progress-text">
                  {Math.round((completedTask / totalTask) * 100)}% Complete
                  ({completedTask} of {totalTask} tasks)
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