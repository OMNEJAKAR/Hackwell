import React from "react";

const TaskList = ({ tasks }) => {
    console.log("in the tasklist i got",tasks);
  return (
    <div className="task-list">
      <h2>Today's Tasks</h2>
      {tasks.length === 0 ? <p>No tasks for today.</p> : (
        <ul>
          {tasks.map((task, index) => (
            <li key={task._id}>
                <strong>{task.title}</strong>: {task.description}  
                {task.allocatedUser && <p>Assigned to: {task.allocatedUser.name}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
