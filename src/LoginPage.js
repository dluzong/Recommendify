import React from "react";
import "./LoginPage.css";

const LoginPage = () => {

  const handleSpotifyLogin = () => {
    console.log("Redirecting to Spotify...");
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
        <p className="slogan">Tailor tracks to match</p>
          <p className="slogan"> your groove</p>
        <div className="separator"></div>
        <button className="sign-in" onClick={handleSpotifyLogin}>
            Sign in with Spotify
            <img
              src="/assets/Spotify.png"
              alt="spotify icon"
              className="spotify-icon"
            />
          </button>
      </div>
    </div>
  );
};

export default LoginPage;
