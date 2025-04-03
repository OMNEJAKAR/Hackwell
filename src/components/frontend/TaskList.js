import React from "react";
import './global.css';

const TaskList = ({ tasks, allocateTask }) => {
  return (
    <div className="content-card">
      <h2 className="content-title">Task List</h2>

      {tasks.length === 0 ? (
        <p className="no-tasks">No tasks available.</p>
      ) : (
        <div className="table-container">
          <table className="task-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Description</th>
                <th>Shift</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.shiftRequired}</td>
                  <td>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {task.allocatedUser ? (
                      <span className="assigned-status">
                        ✅ {task.allocatedUser.name}
                      </span>
                    ) : (
                      <span className="pending-status">❌ Not Assigned</span>
                    )}
                  </td>
                  <td>
                    {task.allocatedUser ? (
                      <span className="allocated-badge">✅ Allocated</span>
                    ) : (
                      <button
                        className="action-btn allocate-btn"
                        onClick={() => allocateTask(task._id)}
                      >
                        Allocate Job
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskList;
