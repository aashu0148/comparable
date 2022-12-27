import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "components/Navbar/Navbar";
import Analytics from "components/Analytics/Analytics";
import Feedback from "components/Feedback/Feedback";
import Home from "components/Home/Home";

import "main.scss";

function App() {
  return (
    <div className="app">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/" element={<Home />} />
          <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
