import React from "react";
import "./LoginPage.css";

const LoginPage = () => {

  // Redirect to the backend Spotify login endpoint
  const handleSpotifyLogin = () => {
    localStorage.removeItem('spotify_access_token');
    window.location.href = "http://localhost:5001/login";
  };

  return (
    <div
      className="login-body"
      style={{ backgroundImage: `url(/assets/background.png)` }}
    >
      <div className="login-container">
        <h1>Recommendify</h1>
        <p>
          Log in with Spotify
          <img
            src="/assets/Spotify.png"
            alt="spotify icon"
            className="spotify-icon"
          />
        </p>
        <button className="sign-in" onClick={handleSpotifyLogin}>
          Sign in with Spotify
        </button>
        <div className="separator">
          <span>or continue with</span>
        </div>
        <button className="google-login">
          <img
            src="/assets/Google.png"
            alt="google icon"
            className="google-icon"
          />
          <span className="google-text">Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
