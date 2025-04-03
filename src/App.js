import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SupervisorTasks from "./components/frontend/SupervisorTasks";
import Login from "./components/frontend/login";
import "./App.css";
import Home from "./components/frontend/home";
import Dashboard from "./components/frontend/DashBoard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<SupervisorTasks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard /> } />
      </Routes>
    </Router>
  );
};

export default App;
