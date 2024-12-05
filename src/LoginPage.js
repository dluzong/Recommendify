import React from 'react';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="login-body" style={{ backgroundImage: `url(/assets/background.png)` }}>
      <div className="login-container">
        <h1>Recommendify</h1>
        <p>
          Log in with Spotify
          <img src="/assets/Spotify.png" alt="spotify icon" className="spotify-icon" />
        </p>
        <input type="email" placeholder="email@domain.com" />
        <input type="password" placeholder="password" />
        <button className="sign-in">Sign in</button>
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
