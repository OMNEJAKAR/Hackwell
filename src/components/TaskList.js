import React from "react";

const TaskList = ({ tasks }) => {
  return (
    <div className="task-list">
      <h2>Today's Tasks</h2>
      {tasks.length === 0 ? <p>No tasks for today.</p> : (
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>{task.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
