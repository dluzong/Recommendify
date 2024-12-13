import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SearchPage.css';

function SearchPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState(new URLSearchParams(location.search).get('query') || '');
    const [searchResults, setSearchResults] = useState(null);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim() !== '') {
            // window.location.href = `/search?query=${searchQuery}`;
            const storedToken = localStorage.getItem("spotify_token");

            fetch(`http://localhost:5001/api/search?query=${searchQuery}`, {
                headers: {
                    Authorization: storedToken,
                },
            })
                .then((res) => res.json())
                .then((data) => setSearchResults(data))
                .catch((err) => console.error("Error searching:", err));
        } else {
            alert('Please enter a search term');
        }
    };

    const handleHome = () => {
        const storedToken = localStorage.getItem("spotify_token");
        navigate(`/home?access_token=${storedToken}`);
    }

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get('query');
        if (query) {
            setSearchQuery(query); // Update state when URL query changes
        }
        const accessToken = queryParams.get("access_token");
        if (accessToken) {
            localStorage.setItem("spotify_token", accessToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        fetch(`http://localhost:5001/api/search?query=${searchQuery}`, {
            headers: {
                Authorization: accessToken,
            },
        })
            .then((res) => res.json())
            .then((data) => setSearchResults(data))
            .catch((err) => console.error("Error searching:", err));

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
                <button className="logout-button" onClick={handleHome}>Home</button>
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
                    {searchResults && searchResults.length > 0 ? (
                        searchResults.map((track, index) => (
                            <div key={index} className="track-card">
                                <img
                                    src={track.album?.images[0]?.url || "/assets/default-image.jpg"}
                                    alt={`${track.name} cover`}
                                    className="track-image"
                                />
                                <div className="track-details">
                                    <h3 className="track-name">{track.name}</h3>
                                    <p className="artist-name">{track.artists[0]?.name || "Unknown Artist"}</p>
                                </div>
                                <button className="add-button">+</button>
                            </div>
                        ))
                    ) : (
                        <p>No results found. Try a different search!</p>
                    )}
                </div>
            </main>

        </div>
    );
}

export default SearchPage;
