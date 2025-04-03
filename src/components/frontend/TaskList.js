import React from "react";

const TaskList = ({ tasks }) => {
  console.log("Received tasks in TaskList:", tasks);

  return (
    <div className="task-list">
      <h2>Today's Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks for today.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task._id} className="task-item">
              <strong>{task.title}</strong>: {task.description}
              {task.allocatedUser ? (
                <p>Assigned to: {task.allocatedUser.name}</p>
              ) : (
                <p className="not-assigned">Not yet assigned</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
