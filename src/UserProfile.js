import React from "react";
import "./UserProfile.css";

const UserProfile = () => {

    return (
        <div className="user-profile">
            <header className="header">
                <div className="logo">Recommendify</div>
                <button className="logout-button">Logout</button>
            </header>
            <div className="profile-info">
                <div className="profile-picture">
                    <img src="/assets/ProfilePic.avif" alt="Profile" />
                </div>
                <h2>User Name</h2> 
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
                    <h3>Top Genres</h3>
                    <ul className="genres">
                        <li>Pop</li>
                        <li>Rock</li>
                        <li>Jazz</li>
                        <li>Classical</li>
                        <li>Hip-Hop</li>
                    </ul>
                </div>
            </div>

        </div>
    )
}

export default UserProfile;