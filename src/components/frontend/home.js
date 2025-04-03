import React from "react";
import {Link} from "react-router-dom";

const Home = () => {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <header className="hero">
        <h1>AI Task Allocation System</h1>
        <p>Effortlessly assign and manage tasks with AI-driven automation.</p>
        <Link to="/login"> <button className="btn-primary">Get Started</button></Link>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2>Key Features</h2>
        <div className="feature-list">
          <div className="feature-card">🚀 Smart Task Allocation</div>
          <div className="feature-card">⏱ Real-time Tracking</div>
          <div className="feature-card">🤝 Seamless Collaboration</div>
          <div className="feature-card">📊 Performance Analytics</div>
        </div>
      </section>
    </div>
  );
};

export default Home;