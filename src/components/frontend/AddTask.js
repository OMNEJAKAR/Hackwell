import React, { useState } from "react";

const AddTask = ({ addTask }) => {
  const [task, setTask] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.trim()) {
      setError("Task cannot be empty!");
      return;
    }
    addTask(task);
    setTask("");
    setError(""); // Clear error after adding task
  };

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter new task"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <button type="submit" disabled={!task.trim()}>Add Task</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default AddTask;
