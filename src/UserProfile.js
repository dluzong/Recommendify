import React, { useState, useEffect } from "react";
import {Link, useNavigate } from 'react-router-dom';
import { useProfile } from './ProfileContext';
import "./UserProfile.css";

const UserProfile = () => {
    const navigate = useNavigate();
    const { displayName, profileImage } = useProfile();
    const [topArtists, setTopArtists] = useState([]);

    const handleHome = () => {
        const storedToken = localStorage.getItem("spotify_token");
        navigate(`/home?access_token=${storedToken}`);
    }

    const fetchTopArtists = async () => {
        const token = localStorage.getItem("spotify_token");
        if (!token) {
            console.error("Spotify token is missing.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/api/top-artists", {
                headers: {
                    Authorization: token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const topArtists = data.items.map((artist) => artist.name);
                setTopArtists(topArtists);
            } else {
                console.error("Failed to fetch top artists", await response.json());
            }
        } catch (error) {
            console.error("Error fetching top artists:", error.message);
        }
    };

    useEffect(() => {
        fetchTopArtists();
    }, []);

    return (
        <div className="user-profile">
            <header className="header">
                <div className="logo">
                    <Link to={"/home"}>
                        Recommendify
                    </Link>
                </div>
                <div>
                    <button className="logout-button" onClick={handleHome}>Home</button>
                    <button className="logout-button">Logout</button>
                </div>
            </header>

            <div className="profile-info">
                <div className="profile-picture">
                    <img src={profileImage} alt="Profile" />
                </div>
                <h2>{displayName}</h2> 
                <div className="line"></div>
            </div>

            <div className="profile-data">
                <div className="left-column">
                    <h3>Playlists</h3>
                    <div className="playlists">
                        <p>No playlists made.</p>
                    </div>
                </div>
                <div className="right-column">
                    <h3>Top Artists</h3>
                    <ul className="genres">
                        {topArtists.length > 0 ? 
                            topArtists.map((artist,index) => <li key={index}>{artist}</li>)
                            : (<p>Top artists could not be loaded.</p>)
                        }
                    </ul>
                </div>
            </div>

        </div>
    )
}

export default UserProfile;