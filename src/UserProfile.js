import React, { useState, useEffect } from "react";
import {useNavigate } from 'react-router-dom';
import { useProfile } from './ProfileContext';
import "./UserProfile.css";

const UserProfile = () => {
    const navigate = useNavigate();
    const { displayName, profileImage } = useProfile();
    const [topArtists, setTopArtists] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    const handleHome = () => {
        const storedToken = localStorage.getItem("spotify_token");
        navigate(`/home?access_token=${storedToken}`);
    }

    const fetchTopArtists = () => {
        const storedToken = localStorage.getItem("spotify_token");

        fetch("http://localhost:5001/api/top-artists", {
            headers: {
                Authorization: storedToken,
            },
        })
        .then((res) => res.json())
        .then((data) => {
            const topArtists = data.items.map((artist) => artist.name);
            setTopArtists(topArtists);
        })
        .catch((error) => {
            console.error("Error fetching top artists:", error.message);
        }); 
    };

    const fetchPlaylists = () => {
        const storedToken = localStorage.getItem("spotify_token");

        fetch("https://api.spotify.com/v1/me/playlists", {
            headers: {
                Authorization: `Bearer ${storedToken}`,
            },
        })
        .then((res) => res.json())
        .then((data) => {
            setPlaylists(data.items);
        })
        .catch((error) => {
            console.error("Error fetching playlists:", error.message);
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("spotify_token"); // clearing the stored token
        navigate("/"); // redirect user to the login page
    };

    useEffect(() => {
        fetchTopArtists();
        fetchPlaylists();
    }, []);

    return (
        <div className="user-profile">
            <header className="header">
                <div>
                    <button className="logo-nav" onClick={handleHome}>Recommendify</button>
                </div>
                <div>
                    <button className="logout-button" onClick={handleHome}>Home</button>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
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
                    <div>
                        {playlists.length > 0 ? (
                            <div className="playlists-grid">
                                {playlists.map((playlist) => (
                                    <div 
                                        key={playlist.id}
                                        className="playlist-item"
                                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                                    >
                                        <img 
                                            src={(playlist.images && playlist.images.length > 0) ? playlist.images[0]?.url : '/assets/default-image.jpg'} 
                                            alt={playlist.name} 
                                            className="playlist-image"
                                        />
                                        <p className="playlist-name">{playlist.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No playlists made.</p>
                        )}
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
