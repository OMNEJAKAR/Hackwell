import React, { useState } from "react";

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
    <div className="register-form-div">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input type="text" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} required />
      

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
