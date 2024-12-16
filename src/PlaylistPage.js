import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProfile } from './ProfileContext';
import './PlaylistPage.css';

function PlaylistPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profileImage } = useProfile();
    const [playlist, setPlaylist] = useState(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selectedTrack, setSelectedTrack] = useState(null);
    const settingsButtonRef = useRef(null);

    const formatDuration = (milliseconds) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleLogout = () => {
        localStorage.removeItem("spotify_token");
        navigate("/");
    };

    const handleHome = () => {
        const storedToken = localStorage.getItem("spotify_token");
        navigate(`/home?access_token=${storedToken}`);
    };

    const handleSettingsClick = (track, event) => {
        setSelectedTrack(track);
        setShowSettingsModal(true);
        const rect = event.target.getBoundingClientRect();
        setModalPosition({ top: rect.bottom, left: rect.left });
    };

    const handleDeleteSong = async () => {
        const storedToken = localStorage.getItem("spotify_token");

        try {
            await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tracks: [{ uri: selectedTrack.uri }],
                }),
            });
            alert("Song removed from playlist");
            setPlaylist((prev) => ({
                ...prev,
                tracks: {
                    ...prev.tracks,
                    items: prev.tracks.items.filter(
                        (item) => item.track.uri !== selectedTrack.uri
                    ),
                },
            }));
            setShowSettingsModal(false);
        } catch (error) {
            console.error("Error removing song:", error);
            alert("Failed to remove song");
        }
    };

    const handleVisitSpotifyUrl = () => {
        window.open(selectedTrack.external_urls.spotify, "_blank");
    };

    const handleVisitArtist = () => {
        window.open(selectedTrack.artists[0].external_urls.spotify, "_blank");
    };

    const handleCloseModal = () => {
        setShowSettingsModal(false);
        setSelectedTrack(null);
    };

    useEffect(() => {
        const fetchPlaylist = async () => {
            const storedToken = localStorage.getItem("spotify_token");

            try {
                const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });
                const data = await response.json();
                setPlaylist(data);
            } catch (error) {
                console.error("Error fetching playlist:", error);
            }
        };

        fetchPlaylist();
    }, [id]);

    if (!playlist) {
        return <p>Loading playlist...</p>;
    }

    return (
        <div className="playlist-page">
            <header className="header">
                <div>
                    <button className="logo-nav" onClick={handleHome}>
                        Recommendify
                    </button>
                </div>
                <div className="header-actions">
                    <button className="logout-button" onClick={handleHome}>
                        Home
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                    <div className="profile-picture">
                        <Link to={"/profile"}>
                            <img src={profileImage} alt="Profile" />
                        </Link>
                    </div>
                </div>
            </header>
            <div className="playlist-header">
                {playlist.images && playlist.images.length > 0 ? (
                    <img
                        src={playlist.images[0]?.url}
                        alt="Playlist Cover"
                        className="playlist-cover"
                    />
                ) : (
                    <div className="no-cover">No cover available</div>
                )}
                <div className="playlist-info">
                    <h2>
                        <a 
                            href={playlist.external_urls.spotify} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="playlist-link"
                        >
                            {playlist.name}
                        </a>
                    </h2>
                    <p>{playlist.description || "No description available"}</p>
                    <p>{playlist.tracks.total} tracks</p>
                </div>
            </div>
            <div className="track-list">
                {playlist.tracks.items && playlist.tracks.items.length > 0 ? (
                    playlist.tracks.items.map((item, index) => (
                        <div key={index} className="track-card">
                            <img
                                src={item.track.album.images[0]?.url || '/assets/default-image.jpg'}
                                alt={`${item.track.name} cover`}
                                className="track-image"
                            />
                            <div className="track-details">
                                <p className="track-name">{item.track.name}</p>
                                <p className="artist-name">
                                    {item.track.artists[0]?.name || "Unknown Artist"}
                                </p>
                                <p className="track-duration">
                                    {formatDuration(item.track.duration_ms)}
                                </p>
                            </div>
                            <button
                                ref={settingsButtonRef}
                                className="settings-button"
                                onClick={(event) => handleSettingsClick(item.track, event)}
                            >
                                ...
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No tracks found in this playlist.</p>
                )}
            </div>
            {showSettingsModal && (
                <div
                    className="settings-modal"
                    style={{ top: modalPosition.top, left: modalPosition.left }}
                >
                    <div className="modal-content">
                        <button className="modal-option" onClick={handleDeleteSong}>
                            Delete Song from Playlist
                        </button>
                        <button className="modal-option" onClick={handleVisitSpotifyUrl}>
                            Visit Song on Spotify
                        </button>
                        <button className="modal-option" onClick={handleVisitArtist}>
                            Visit Artist on Spotify
                        </button>
                        <button className="modal-option close-option" onClick={handleCloseModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlaylistPage;
