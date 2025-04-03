
import { useState } from "react";

function Sidebar()
{
      const [activePage, setActivePage] = useState('dashboard');

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'assigned', label: 'Assigned Tasks', icon: '📋' },
        { id: 'add-tasks', label: 'Add Tasks', icon: '➕' },
        { id: 'add-users', label: 'Add Users', icon: '👥' },
        { id: 'status', label: 'Status', icon: '📊' },
        { id: 'contact', label: 'Developer Contact', icon: '📞' },
      ];

    return (
        <>
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
        </>
    )
}
export default Sidebar;