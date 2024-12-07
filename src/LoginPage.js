import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate hook used for routing
import './LoginPage.css';

const LoginPage = () => {

  // intializng navigate
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // handling login functionality, so once a user logs in, they will be redirected to the home page.
  const handleLogin = (e) => {
    e.preventDefault();

    if (email && password) {
      navigate('/home');
    } else {
      alert('Please enter both email and password');
    }
  };

  return (
    <div className="login-body" style={{ backgroundImage: `url(/assets/background.png)` }}>
      <div className="login-container">
        <h1>Recommendify</h1>
        <p>
          Log in with Spotify
          <img src="/assets/Spotify.png" alt="spotify icon" className="spotify-icon" />
        </p>
        <input
          type="email"
          placeholder="email@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="sign-in" onClick={handleLogin}>Sign in</button> {/* running handleLogin on button click */}
        <div className="separator">
          <span>or continue with</span>
        </div>
        <button className="google-login">
          <img src="/assets/Google.png" alt="google icon" className="google-icon" />
          <span className="google-text">Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
