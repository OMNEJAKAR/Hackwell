import React, { useState, useEffect } from "react";
import TaskList from "./TaskList";
import AddTask from "./AddTask";

const SupervisorTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  const addTask = (newTask) => {
    fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTask, date: new Date().toISOString().split("T")[0] }),
    })
      .then((res) => res.json())
      .then((task) => setTasks([...tasks, task]))
      .catch((err) => console.error("Error adding task:", err));
  };

  return (
    <div className="container">
      <h1>Supervisor Task Management</h1>
      <AddTask addTask={addTask} />
      <TaskList tasks={tasks} />
    </div>
  );
};

export default SupervisorTasks;
