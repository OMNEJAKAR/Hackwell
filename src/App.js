import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SupervisorTasks from "./components/SupervisorTasks";
import RegisterForm from "./components/client-side/registration";
import "./App.css";



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/tasks" element={<SupervisorTasks />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </Router>
  );
};

export default App;
