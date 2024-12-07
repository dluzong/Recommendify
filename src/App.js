import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // importing the router components
import LoginPage from './LoginPage';
import HomePage from './HomePage';

function App() {
  const [backendData, setBackendData] = useState([{}]);

  useEffect(() => {
    console.log("Fetching from /api...");
    fetch("/api")
      .then(response => response.json())
      .then(data => {
        console.log("Data fetched: ", data);
        setBackendData(data);
      })
      .catch(error => console.log("Error fetching data:", error));
  }, []);

  return (
    <Router>
      <Routes>
        {/* adding a route for LoginPage */}
        <Route path="/" element={<LoginPage />} />
        
        {/* adding a route for the HomePage */}
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;