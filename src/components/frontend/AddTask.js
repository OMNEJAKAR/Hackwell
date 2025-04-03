import React, { useState } from "react";

const AddTask = ({ addTask }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shiftRequired, setShiftRequired] = useState("Day");

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask({ title, description, shiftRequired });
    setTitle("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="add-task">
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      ></textarea>
      <select value={shiftRequired} onChange={(e) => setShiftRequired(e.target.value)}>
        <option value="Day">Day</option>
        <option value="Night">Night</option>
      </select>
      <button type="submit">Create Task</button>
    </form>
  );
};

export default AddTask;
