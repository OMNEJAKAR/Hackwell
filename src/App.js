import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SupervisorTasks from "./components/frontend/SupervisorTasks";
import RegisterForm from "./components/frontend/registration";
import "./App.css";
import Home from "./components/frontend/home";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<SupervisorTasks />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </Router>
  );
};

export default App;
