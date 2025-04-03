import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero">
        <h1>AI Task Allocation System</h1>
        <p>Efficiently manage and distribute tasks with AI-powered automation.</p>
        <Link to="/login" ><button className="cta-button">Get Started</button></Link>
      </header>
      
      <section className="about">
        <h2>Why Choose Our System?</h2>
        <p>Our AI-driven system intelligently assigns tasks based on priority, skillset, and availability, ensuring maximum productivity.</p>
      </section>
      
      <section className="features add-task">
        <h2>Key Features</h2>
        <ul>
          <li>Smart Task Allocation</li>
          <li>Real-time Tracking</li>
          <li>Seamless Collaboration</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
