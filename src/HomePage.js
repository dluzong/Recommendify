import React from 'react';
import './HomePage.css';

function HomePage() {
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
                <button className="logout-button">Logout</button>
                <div className="profile-picture">
                    <img src="/assets/ProfilePic.avif" alt="Profile" />
                </div>
            </header>
        </div>
    );
}

export default HomePage;