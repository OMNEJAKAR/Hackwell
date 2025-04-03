import React, { useState } from "react";

const skillsList = ["Web Development", "Node.js", "MongoDB", "JavaScript", "CSS", "Python"];

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    skills: [],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e) => {
    const skill = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      skills: prevData.skills.includes(skill)
        ? prevData.skills.filter((s) => s !== skill)
        : [...prevData.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("User registered successfully!");
        setFormData({ name: "", email: "", password: "", skills: [] }); // Reset form
      } else {
        alert("Error registering user.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input type="text" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
      <input type="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} required />
      
      <div className="skills-container">
        <label>Select Skills:</label>
        {skillsList.map((skill) => (
          <div key={skill} className="skill-option">
            <input type="checkbox" value={skill} checked={formData.skills.includes(skill)} onChange={handleSkillChange} />
            <label>{skill}</label>
          </div>
        ))}
      </div>

      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
