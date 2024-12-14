import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // importing the router components
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import SearchPage from './SearchPage';
import UserProfile from './UserProfile';

function App() {

  return (
    <Router>
      <Routes>
        {/* adding a route for LoginPage */}
        <Route path="/" element={<LoginPage />} />
        {/* adding a route for the HomePage */}
        <Route path="/home" element={<HomePage />} />
        {/* adding a route for the SearchPage */}
        <Route path="/search" element={<SearchPage />} />
        {/* adding a route for the UserProfile */}
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
