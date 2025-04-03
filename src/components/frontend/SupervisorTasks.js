import React, { useState, useEffect } from "react";
import TaskList from "./TaskList";
import AddTask from "./AddTask";

const SupervisorTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tasks from backend
  const fetchTasks = () => {
    fetch("http://localhost:5000/tasks")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched tasks:", data);
        setTasks(data);
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Try again.");
      })
      .finally(() => setLoading(false));
  };

  // Fetch tasks once when the component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // Add task and refresh the list
  const addTask = (newTask) => {
    fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTask.title,
        description: newTask.description,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchTasks(); // Fetch the latest tasks after adding a new one
      })
      .catch((err) => {
        console.error("Error adding task:", err);
        setError("Failed to add task. Try again.");
      });
  };

  return (
    <div className="container">
      <h1>Supervisor Task Management</h1>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <>
          <AddTask addTask={addTask} />
          <TaskList tasks={tasks} />
        </>
      )}
    </div>
  );
};

export default SupervisorTasks;
