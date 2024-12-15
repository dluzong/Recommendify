import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PlaylistPage.css';

function PlaylistPage() {
    const { id } = useParams(); 
    const [playlist, setPlaylist] = useState(null);

   
    const formatDuration = (milliseconds) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
            <div className="playlist-header">
                {/* Check if playlist.images exists and has data */}
                {playlist.images && playlist.images.length > 0 ? (
                    <img src={playlist.images[0]?.url} alt="Playlist Cover" className="playlist-cover" />
                ) : (
                    <div className="no-cover">No cover available</div>
                )}
                
                <div className="playlist-info">
                    <h2>{playlist.name}</h2>
                    <p>{playlist.description || "No description available"}</p>
                    <p>{playlist.tracks.total} tracks</p>
                </div>
            </div>
            <div className="track-list">
                {/* Check if playlist.tracks.items exists and has data */}
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
                                <p className="artist-name">{item.track.artists[0]?.name || "Unknown Artist"}</p>
                                <p className="track-duration">{formatDuration(item.track.duration_ms)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No tracks found in this playlist.</p>
                )}
            </div>
        </div>
    );
}

export default PlaylistPage;
