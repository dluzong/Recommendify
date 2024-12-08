import React, { useEffect, useState } from "react";
import "./HomePage.css";
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const [profileData, setProfileData] = useState(null); // State to store profile data
    const navigate = useNavigate();

    useEffect(() => {
        // Extract access token from the URL query string
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");
    
        // If access token exists, store it in localStorage and clean URL
        if (accessToken) {
            localStorage.setItem("spotify_token", accessToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    
        // Retrieve access token from localStorage
        const storedToken = localStorage.getItem("spotify_token");
    
        if (storedToken) {
            // Fetch user profile data
            fetch("http://localhost:5001/api/spotify-profile", {
                headers: {
                    Authorization: storedToken, // Pass token in headers
                },
            })
                .then((res) => res.json())
                .then((data) => setProfileData(data)) // Update profile data
                .catch((err) => console.error("Error fetching profile:", err));
        } else {
            // Redirect back to login if no token exists
            window.location.href = "http://localhost:5001/login";
        }
    }, []);

    const handleSpotifyLogout = async () => {
        try {
            // Clear client-side token
            localStorage.removeItem("spotify_token");
            setProfileData(null);
            
            // Call backend to handle logout
            const response = await fetch("http://localhost:5001/logout", {
                method: "POST",
                credentials: "include", // Include cookies if sessions are used
            });
    
            if (response.ok) {
                console.log("Logged out successfully");
            } else {
                console.error("Logout failed on server");
            }
        } catch (err) {
            console.error("Error during logout:", err.message);
        }
    
        // Redirect to login page
        // window.location.href = "http://localhost:5001/";
        navigate('/');
    };

    return (
        <div className="home-page">
            <header className="header">
                <div className="logo">Recommendify</div>
                <div className="search-bar-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search..."
                    />
                    <span className="magnifying-glass">🔍</span>
                </div>
                <button className="logout-button" onClick={handleSpotifyLogout}>Logout</button>
                {profileData && profileData.images && profileData.images.length > 0 && (
                    <div className="profile-picture">
                        <img src={profileData.images[0].url} alt="Profile" />
                    </div>
                )}
            </header>

            <main>
                <h1>Display your Spotify Profile Data</h1>
                {profileData ? (
                    <section id="profile">
                        <h2>
                            Logged in as <span>{profileData.display_name}</span>
                        </h2>
                        <img
                            src={
                                profileData.images && profileData.images.length > 0
                                    ? profileData.images[0].url
                                    : "/assets/ProfilePic.avif"
                            }
                            width="200"
                            alt="Avatar"
                        />
                        <ul>
                            <li>User ID: {profileData.id}</li>
                            <li>Email: {profileData.email}</li>
                            <li>
                                Spotify URI:{" "}
                                <a href={profileData.uri} target="_blank" rel="noreferrer">
                                    {profileData.uri}
                                </a>
                            </li>
                            <li>
                                Link:{" "}
                                <a href={profileData.external_urls.spotify} target="_blank" rel="noreferrer">
                                    {profileData.external_urls.spotify}
                                </a>
                            </li>
                        </ul>
                    </section>
                ) : (
                    <p>Loading your profile data...</p>
                )}
            </main>
        </div>
    );
}

export default HomePage;
