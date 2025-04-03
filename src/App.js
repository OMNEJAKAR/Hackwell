import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SupervisorTasks from "./components/SupervisorTasks";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/tasks" element={<SupervisorTasks />} />
      </Routes>
    </Router>
  );
};

export default App;
