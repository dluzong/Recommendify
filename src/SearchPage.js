import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./SearchPage.css";

function SearchPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState(new URLSearchParams(location.search).get("query") || "");
    const [submittedQuery, setSubmittedQuery] = useState(searchQuery);
    const [searchResults, setSearchResults] = useState(null);
    const [showCreatePlaylistPopup, setShowCreatePlaylistPopup] = useState(false);
    const [playlistGenre, setPlaylistGenre] = useState("");
    const [playlistSize, setPlaylistSize] = useState(10);

    const genres = ["pop", "rock", "hip-hop", "jazz", "classical", "country", "electronic", "reggae", "blues", "metal"];

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim() !== "") {
            setSubmittedQuery(searchQuery);
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
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
            alert("Please enter a search term");
        }
    };

    const handleCreatePlaylist = () => {
        const storedToken = localStorage.getItem("spotify_token");
        fetch(`http://localhost:5001/api/genre?genre=${playlistGenre}&limit=${playlistSize}`, {
            headers: {
                Authorization: storedToken,
            },
        })
            .then((res) => res.json())
            .then((tracks) => {
                if (tracks.length > 0) {
                    const trackUris = tracks.map((track) => track.uri);

                    // Save the playlist
                    fetch(`http://localhost:5001/api/create-playlist`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: storedToken,
                        },
                        body: JSON.stringify({
                            name: `My ${playlistGenre} Playlist`,
                            description: `A playlist of ${playlistSize} ${playlistGenre} songs.`,
                            tracks: trackUris,
                        }),
                    })
                        .then((res) => res.json())
                        .then(() => {
                            alert("Playlist created successfully!");
                            setShowCreatePlaylistPopup(false);
                        })
                        .catch((err) => {
                            console.error("Error creating playlist:", err);
                        });
                } else {
                    alert("No songs found for the selected genre.");
                }
            })
            .catch((err) => console.error("Error fetching songs by genre:", err));
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get("query");
        const accessToken = queryParams.get("access_token");

        if (accessToken) {
            localStorage.setItem("spotify_token", accessToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (query) {
            setSearchQuery(query);
            setSubmittedQuery(query);
        }
    }, [location.search]);

    useEffect(() => {
        if (submittedQuery.trim() !== "") {
            const storedToken = localStorage.getItem("spotify_token");

            fetch(`http://localhost:5001/api/search?query=${submittedQuery}`, {
                headers: {
                    Authorization: storedToken,
                },
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error("Failed to fetch results");
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data && data.length > 0) {
                        setSearchResults(data);
                    } else {
                        setSearchResults([]);
                    }
                })
                .catch((err) => {
                    console.error("Error searching:", err);
                    setSearchResults([]);
                });
        }
    }, [submittedQuery]);

    return (
        <div className="search-page">
            <header className="header">
                <div className="logo">
                    <Link to={"/home"}>Recommendify</Link>
                </div>
                <div className="search-bar-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    />
                    <span className="magnifying-glass" onClick={handleSearchSubmit}>🔍</span>
                </div>
                <button className="logout-button" onClick={() => navigate("/home")}>Home</button>
                <button className="logout-button">Logout</button>
                <div className="profile-picture">
                    <img src="/assets/ProfilePic.avif" alt="Profile" />
                </div>
            </header>

            <main>
                <div className="search-results-header">
                    <h2>Search Results for: {submittedQuery}</h2>
                    <button
                        className="create-playlist-button"
                        onClick={() => setShowCreatePlaylistPopup(true)}
                    >
                        Create Playlist
                    </button>
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

            {showCreatePlaylistPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Create a Playlist</h3>
                        <label>
                            Genre:
                            <select value={playlistGenre} onChange={(e) => setPlaylistGenre(e.target.value)}>
                                <option value="">Select Genre</option>
                                {genres.map((g) => (
                                    <option key={g} value={g}>
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Number of Songs:
                            <input
                                type="number"
                                value={playlistSize}
                                onChange={(e) => setPlaylistSize(e.target.value)}
                                min="1"
                                max="50"
                            />
                        </label>
                        <div className="popup-actions">
                            <button onClick={handleCreatePlaylist}>Generate Playlist</button>
                            <button onClick={() => setShowCreatePlaylistPopup(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchPage;
