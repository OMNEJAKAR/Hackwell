import React from "react";
import "./global.css";

const TaskList = ({ tasks, setTasks, allocateTask }) => {
  
  // ✅ Delete Task Function
  const deleteTask = async (taskId, userId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      if (userId) {
        await fetch(`http://localhost:5000/users/decrement/${userId}`, {
          method: "PUT",
        });
      }

      // ✅ Functional state update to avoid stale data issues
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));

      alert("Task successfully deleted!");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task.");
    }
  };

  // ✅ Complete Task Function
  const completeTask = async (taskId, currentStatus) => {
    if (currentStatus === "Completed") {
      alert("Task is already completed!");
      return;
    }

    if (!window.confirm("Are you sure you want to mark this task as completed?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark task as completed");
      }

      // ✅ Get updated task from API response
      const updatedData = await response.json();
      const updatedTask = updatedData.task;

      // ✅ Functional state update to ensure correct UI rendering
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? { ...task, status: updatedTask.status } : task
        )
      );

      alert("Task successfully marked as completed!");
    } catch (error) {
      console.error("Error updating task status:", error);
      alert(error.message);
    }
  };

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
                <th>Status</th>
                <th>Actions</th>
                <th>Delete</th>
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
                    {/* ✅ Status Button (Ongoing → Completed) */}
                    <button
                      className={`status-badge ${task.status === "Completed" ? "completed" : "ongoing"}`}
                      onClick={() => completeTask(task._id, task.status)}
                    >
                      {task.status}
                    </button>
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
                  <td>
                    {/* ✅ Delete Button */}
                    <button
                      className="action-btn delete-btn"
                      onClick={() => deleteTask(task._id, task.allocatedUser?._id)}
                    >
                      🗑
                    </button>
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
