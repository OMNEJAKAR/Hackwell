import React, { useState } from "react";

const AddTask = ({ addTask }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError("Both title and description are required!");
      return;
    }

    const newTask = { title, description };

    try {
      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
      

        const data = await response.json();
        console.log(data.message)
        alert("task allocated")
      addTask(data); // Add task to UI
      setTitle("");
      setDescription("");
      setError("");
    } catch (err) {
      setError("Error adding task. Try again!");
    }
  };

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit" disabled={!title.trim() || !description.trim()}>Add Task</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default AddTask;
