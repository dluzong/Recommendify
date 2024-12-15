import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from './ProfileContext';
import './SearchPage.css';

function SearchPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState(new URLSearchParams(location.search).get('query') || '');
    const [submittedQuery, setSubmittedQuery] = useState(searchQuery);
    const [searchResults, setSearchResults] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selectedTrackId, setSelectedTrackId] = useState(null);  

    const { displayName, profileImage } = useProfile();
    const addButtonRef = useRef(null); 

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value); 
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim() !== '') {
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
            alert('Please enter a search term');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("spotify_token"); // clearing the stored token
        navigate("/"); // redirect user to the login page
    };

    const handleHome = () => {
        const storedToken = localStorage.getItem("spotify_token");
        navigate(`/home?access_token=${storedToken}`);
    };

    const handleAddToPlaylist = (track) => {
        setSelectedTrackId(track.id); 
        setSelectedTrack(track); 
        const storedToken = localStorage.getItem("spotify_token");
    
        fetch("https://api.spotify.com/v1/me/playlists", {
            headers: {
                Authorization: `Bearer ${storedToken}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setPlaylists(data.items); 
                setShowPlaylistModal(true); 
            })
            .catch((err) => console.error("Error fetching playlists:", err));
    };

    const handlePlaylistSelect = (playlistId) => {
        const storedToken = localStorage.getItem("spotify_token");
    
        fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: [selectedTrack.uri],
            }),
        })
            .then((res) => res.json())
            .then(() => {
                alert('Track added to playlist');
                setShowPlaylistModal(false);
                setSelectedTrackId(null); 
                navigate(`/playlist/${playlistId}`); 
            })
            .catch((err) => console.error("Error adding track:", err));
    };
    
    const handleCreateNewPlaylist = async () => {
        const storedToken = localStorage.getItem("spotify_token");
    
        try {
            const createPlaylistResponse = await fetch("https://api.spotify.com/v1/me/playlists", {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newPlaylistName,
                    public: false, 
                }),
            });
    
            const playlistData = await createPlaylistResponse.json();
    
            const addTrackResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uris: [selectedTrack.uri], 
                }),
            });
    
            const addTrackData = await addTrackResponse.json();
    
            if (addTrackData.snapshot_id) {
                setShowPlaylistModal(false);
                setSelectedTrackId(null); 
                navigate(`/playlist/${playlistData.id}`); 
            } else {
                console.error("Failed to add track to playlist");
            }
        } catch (error) {
            console.error("Error creating playlist or adding track:", error);
        }
    };

    const handleCreatePlaylistAll = async () => {
        const storedToken = localStorage.getItem("spotify_token");

    if (!searchResults || searchResults.length === 0) {
        alert("No search results to create a playlist. Try searching for something!");
        return;
    }

    try {
        // Step 1: Create a new playlist
        const createPlaylistResponse = await fetch("https://api.spotify.com/v1/me/playlists", {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: `Recommendify Playlist - ${searchQuery}`,
                public: false,
            }),
        });

        const playlistData = await createPlaylistResponse.json();

        if (!playlistData.id) {
            console.error("Error creating playlist:", playlistData);
            alert("Failed to create a playlist. Please try again.");
            return;
        }

        // Step 2: Add tracks to the newly created playlist
        const trackUris = searchResults.slice(0, 20).map((track) => track.uri); // Limit to 20 tracks
        const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: trackUris,
            }),
        });

        const addTracksData = await addTracksResponse.json();

        if (addTracksData.snapshot_id) {
            alert(`Playlist "${playlistData.name}" created successfully!`);
        } else {
            console.error("Failed to add tracks:", addTracksData);
            alert("Failed to add tracks to the playlist. Please try again.");
        }
    } catch (error) {
        console.error("Error creating playlist or adding tracks:", error);
        alert("An error occurred. Please try again.");
    }

    };
    

    const handleCloseModal = () => {
        setShowPlaylistModal(false); 
        setSelectedTrackId(null); 
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get('query');
        const accessToken = queryParams.get('access_token');
    
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
        if (submittedQuery.trim() !== '') {
            const storedToken = localStorage.getItem("spotify_token");
    
            fetch(`http://localhost:5001/api/search?query=${submittedQuery}`, {
                headers: {
                    Authorization: storedToken,
                },
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch results');
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
            {/* Reusable Header */}
            <header className="header">
                <div>
                    <button className="logo-nav" onClick={handleHome}>Recommendify</button>
                </div>
                <div className="search-bar-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()} 
                    />
                    <span className="magnifying-glass" onClick={handleSearchSubmit}>🔍</span>
                </div>
                <button className="logout-button" onClick={handleHome}>Home</button>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
                <div className="profile-picture">
                    <Link to={"/profile"}>
                        <img src={profileImage} alt="Profile" />
                    </Link>
                </div>
            </header>

            {/* Search Results */}
            <main>
                <div className="search-results-header">
                    <h2>Search Results for: {submittedQuery}</h2> {/* Show submitted query */}
                    {/*<button className="create-playlist-button">Create Playlist</button>*/}
                    <button className="create-playlist-button" onClick={handleCreatePlaylistAll}>Create Playlist</button>
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
                                <div className="add-button-container">
                                    <button 
                                        ref={addButtonRef} 
                                        className="add-button" 
                                        onClick={() => handleAddToPlaylist(track)}
                                    >
                                        +
                                    </button>
                                    {showPlaylistModal && selectedTrackId === track.id && (
                                        <div className="playlist-modal" style={{ top: modalPosition.top, left: modalPosition.left }}>
                                            <div className="modal-content">
                                                <div className="playlist-list">
                                                    {playlists.length > 0 ? (
                                                        playlists.map((playlist) => (
                                                            <button
                                                                key={playlist.id}
                                                                className="playlist-option"
                                                                onClick={() => handlePlaylistSelect(playlist.id)}
                                                            >
                                                                {playlist.name}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p>No playlists found. Create a new one!</p>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="New Playlist Name"
                                                    value={newPlaylistName}
                                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                                />
                                                <button className="create-playlist-button" onClick={handleCreateNewPlaylist}>Create New Playlist</button>
                                                <button className= "close-option" onClick={handleCloseModal}>Close</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
