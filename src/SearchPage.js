import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './SearchPage.css';

function SearchPage() {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState(new URLSearchParams(location.search).get('query') || '');

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim() !== '') {
            window.location.href = `/search?query=${searchQuery}`;
        } else {
            alert('Please enter a search term');
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get('query');
        if (query) {
            setSearchQuery(query); // Update state when URL query changes
        }
    }, [location.search]);

    return (
        <div className="search-page">
            {/* Reusable Header */}
            <header className="header">
                <div className="logo">Recommendify</div>
                <div className="search-bar-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}  // Submit search on Enter
                    />
                    <span className="magnifying-glass" onClick={handleSearchSubmit}>🔍</span>
                </div>
                <button className="logout-button">Logout</button>
                <div className="profile-picture">
                    <img src="/assets/ProfilePic.avif" alt="Profile" />
                </div>
            </header>

            {/* Search Results */}
            <main>
                <div className="search-results-header">
                    <h2>Search Results for: {searchQuery}</h2>
                    <button className="create-playlist-button">Create Playlist</button>
                </div>
                <div className="divider"></div>
                <div className="search-results">
                    {/*fetch tracks from API*/}
                </div>
            </main>

        </div>
    );
}

export default SearchPage;
