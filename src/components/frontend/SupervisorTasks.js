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

  const allocateTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/tasks/allocate/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error("Failed to allocate task");
      }
  
      const updatedTask = await response.json();
  
      if (!updatedTask.task.allocatedUser) {
        alert("❌ No workers available to allocate this task!");
        return;
      }
  
      setTasks(prevTasks =>
        prevTasks.map(task => 
          task._id === updatedTask.task._id ? updatedTask.task : task
        )
      );
  
      alert(`✅ Task successfully allocated to ${updatedTask.task.allocatedUser.name}`);
    } catch (error) {
      console.error("Error allocating task:", error);
      alert("❌ No workers available to allocate this task!");
    }
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
