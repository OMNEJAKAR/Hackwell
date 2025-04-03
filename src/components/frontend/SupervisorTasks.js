import React, { useState, useEffect } from "react";
import TaskList from "./TaskList";
import AddTask from "./AddTask";

const SupervisorTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched tasks:", data);
        setTasks(data);
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  const addTask = (newTask) => {
    fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then((task) => setTasks([...tasks, task.task]))
      .catch((err) => console.error("Error adding task:", err));
  };

  const allocateTask = (taskId) => {
    fetch(`http://localhost:5000/tasks/allocate/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((updatedTask) => {
        setTasks(tasks.map(task => task._id === updatedTask.task._id ? updatedTask.task : task));
      })
      .catch((err) => console.error("Error allocating task:", err));
  };

  return (
    <div className="container">
      <h1>Supervisor Task Management</h1>
      <AddTask addTask={addTask} />
      <TaskList tasks={tasks} setTasks={setTasks} allocateTask={allocateTask}/>
    </div>
  );
};

export default SupervisorTasks;
