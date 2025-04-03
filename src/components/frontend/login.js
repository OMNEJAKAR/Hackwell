import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const Navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // alert("Logged In successfully!");
        Navigate("/dashboard");
        localStorage.setItem("token", data.token);
        setFormData({ email: "", password: "" }); // Reset form
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
        <h2>Login</h2>
        <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} required />
      

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
