import React, { useState, useEffect } from "react";
import TaskList from "./TaskList";
import AddTask from "./AddTask";

const SupervisorTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched tasks: in tasklist", data); // Debugging
        setTasks(data);
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);
  

  const addTask = (newTask) => {
    fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTask.title, 
        description: newTask.description,
        skillsRequired: newTask.skillsRequired || ["General"], 
      }),
    })
      .then((res) => res.json())
      .then((task) => {
        console.log("Task added:", task);
        setTasks([...tasks, task]);
      })
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
