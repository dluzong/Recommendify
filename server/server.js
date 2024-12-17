var express = require('express');
var cors = require('cors');
var querystring = require('querystring');

require("dotenv").config();

const app = express();
app.use(express.json()); //to parse json
app.use(express.static(__dirname + '/public')).use(cors());

const PORT = 5001;
const fetch = require('node-fetch'); 

// Spotify API credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Example root route
app.get('/', (req, res) => {
    // res.send('Welcome to the Recommendify API!');
    res.redirect("/login");
});


app.get("/login", (req, res) => {
    const scope = "user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private playlist-read-private";
    const authUrl = "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
            response_type: "code",
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            prompt: "login",
            show_dialog: true,
        });
    res.redirect(authUrl);
});


app.get("/callback", async (req, res) => {
    console.log("callback route...")
    const code = req.query.code || null; // The code returned by Spotify after user logs in
    if (!code) {
        console.error("No code received from Spotify");
        return res.redirect("http://localhost:3000");
        // return res.status(400).send("No code received from Spotify");
    }

    try {
        // Use fetch with proper request format
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
        });

        const data = await response.json(); // Convert response to JSON

        if (response.ok) {
            const { access_token, refresh_token } = data;

            // Redirect to React app's home page with the access_token
            res.redirect(`http://localhost:3000/home?access_token=${access_token}`);
        } else {
            console.error("Error fetching token:", data);
            res.status(response.status).send(data);
        }
    } catch (error) {
        console.error("Error getting tokens: ", error.message);
        res.status(500).send("Authentication failed");
    }
});

app.post("/refresh_token", async (req, res) => {
    const { refresh_token } = req.body;
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refresh_token,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            res.json(data); // Return the new access_token
        } else {
            res.status(response.status).send(data);
        }
    } catch (error) {
        console.error("Error refreshing token:", error.message);
        res.status(500).send("Failed to refresh token");
    }
});

app.get("/api/spotify-profile", async (req, res) => {
    const accessToken = req.headers["authorization"];
    if (!accessToken) {
        return res.status(401).json({ error: "Access Token Missing" });
    }

    try {
        // Fetch user's Spotify profile using fetch
        const response = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    
        const data = await response.json(); // Convert response to JSON
    
        if (response.ok) {
            // Return Spotify user data
            res.json(data);
        } else {
            console.error("Error fetching profile:", data);
            res.status(response.status).json({ error: "Failed to fetch profile data" });
        }
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        res.status(500).json({ error: "Failed to fetch profile data" });
    }    
});

app.get("/api/top-artists", async (req, res) => {
    const accessToken = req.headers["authorization"];
    if (!accessToken) {
        return res.status(401).json({ error: "Access Token Missing" });
    }

    try {
        // Fetch user's Spotify profile using fetch
        const response = await fetch("https://api.spotify.com/v1/me/top/artists?limit=5", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    
        const data = await response.json(); // Convert response to JSON
    
        if (response.ok) {
            // Return Spotify user data
            res.json(data);
        } else {
            console.error("Error fetching top artists:", data);
            res.status(response.status).json({ error: "Failed to fetch top artists" });
        }
    } catch (error) {
        console.error("Error fetching top artists:", error.message);
        res.status(500).json({ error: "Failed to fetch top artists" });
    }    
});

app.post("/logout", (req, res) => {
    try {
        res.clearCookie("spotify_session");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error.message);
        res.status(500).json({ error: "Logout failed" });
    }
});

app.get("/api/search", async (req, res) => {
    const { query } = req.query;  // query can be a genre or a year
    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ error: "Access Token Missing" });
    }

    try {
        // Fetch access token (ensure it’s valid)
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
        const response = await fetch(searchUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        const data = await response.json();

        if (response.ok) {
            console.log(data);
            res.json(data.tracks.items);  // Send back the list of tracks
        } else {
            res.status(response.status).json({ error: "Error fetching search results from Spotify" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch search results" });
    }
});


// Only workaround is to go to the search and type in the artist and the search shows similar artists
app.get("/api/recommend-artists", async (req, res) => {
    const accessToken = req.headers["authorization"];
    if (!accessToken) {
        return res.status(401).json({ error: "Access Token Missing" });
    }

    try {
        const limit = 5; // Max number of artists able to fetch
        const recommendedArtists = []; // To store final recommended artists
        let final = [];
        // Fetch user's top artists
        const topArtistsResponse = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=${limit}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const topArtistsData = await topArtistsResponse.json();

        if (!topArtistsResponse.ok) {
            console.error("Error fetching top artists:", topArtistsData);
            return res.status(topArtistsResponse.status).json({ error: "Failed to fetch top artists" });
        }

        // Extract artist names
        const artistNames = topArtistsData.items.map((artist) => artist.name);

        // Use search to find recommended artists 
        for (const name of artistNames) {
            try {
                const searchResponse = await fetch(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=10`,
                    {
                        method: "GET",
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );

                const searchData = await searchResponse.json();

                if (searchResponse.ok) {
                    let doNotAddList = new Set();  // Use Set for efficient duplicate checks
                    searchData.artists.items.forEach((artist, index) => {
                        if (artist.external_urls.spotify && artist.images[0]?.url && artist.genres.length > 0) {
                            if (!artistNames.includes(artist.name) && !doNotAddList.has(artist.name)) {
                                recommendedArtists.push({
                                    index: index,
                                    name: artist.name,
                                    genre: artist.genres[0],
                                    image: artist.images[0].url,
                                    spotify: artist.external_urls.spotify,
                                });
                                doNotAddList.add(artist.name);  // Add to Set
                            }
                        }
                    });
                    
                    if (recommendedArtists.length > 6) {
                        const selectedArtists = [];
                        const selectedIndexes = new Set();
                        
                        while (selectedIndexes.size < 6) {
                            const randomIndex = Math.floor(Math.random() * recommendedArtists.length);
                            selectedIndexes.add(randomIndex);
                        }
                
                        selectedIndexes.forEach(index => {
                            selectedArtists.push(recommendedArtists[index]);
                        });
                
                        final = selectedArtists;  // Replace with selected 6 random artists
                    }
                
                } else {
                    console.error(`Error searching for ${name}:`, searchData);
                }
            } catch (error) {
                console.error(`Error fetching related artists for ${name}:`, error.message);
            }
        }
        res.json(final);

    } catch (error) {
        console.error("Error fetching top artists:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get("/api/recommend-songs", async (req, res) => {
    const accessToken = req.headers["authorization"];
    if (!accessToken) {
        return res.status(401).json({ error: "Access Token Missing" });
    }

    try {
        const limit = 5; // Max number of tracks able to fetch
        const recommendedSongs = []; // To store final recommended tracks
        let final = [];
        // Fetch user's top tracks
        const topTracksResponse = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const topTracksData = await topTracksResponse.json();

        if (!topTracksResponse.ok) {
            console.error("Error fetching top tracks:", topTracksData);
            return res.status(topTracksResponse.status).json({ error: "Failed to fetch top tracks" });
        }

        topTracksData.items.forEach((item, index) => {
            recommendedSongs.push({
                index: index,
                src: item.album.images[0]?.url || null, 
                title: `${item.artists[0]?.name} - ${item.name}`,
                spotify: item.external_urls.spotify,
            });
        });
        
        res.json(recommendedSongs);

    } catch (error) {
        console.error("Error fetching top tracks:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/api/add-to-playlist", async (req, res) => {
    const { playlistId, trackUri } = req.body; 
    const accessToken = req.headers["authorization"];

    if (!accessToken) {
        return res.status(401).json({ error: "Access Token Missing" });
    }

    if (!playlistId || !trackUri) {
        return res.status(400).json({ error: "Playlist ID and Track URI are required" });
    }

    try {
        // Add the track to the specified playlist
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uris: [trackUri], 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            res.json(data); 
        } else {
            console.error("Error adding track to playlist:", data);
            res.status(response.status).json({ error: "Failed to add track to playlist" });
        }
    } catch (error) {
        console.error("Error adding track to playlist:", error.message);
        res.status(500).json({ error: "Failed to add track to playlist" });
    }
});

app.post("/api/create-playlist", async (req, res) => {
    const { playlistName, trackUris } = req.body; 
    const accessToken = req.headers["authorization"]; 
    
    if (!accessToken) {
        return res.status(401).json({ error: "Access Token Missing" });
    }
    
    if (!playlistName || !trackUris || !Array.isArray(trackUris) || trackUris.length === 0) {
        return res.status(400).json({ error: "Playlist name and at least one track URI are required" });
    }

    try {
        //create new playlist
        const createPlaylistResponse = await fetch("https://api.spotify.com/v1/me/playlists", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: playlistName,
                description: "Created with Recommendify",
                public: false, // Private playlist
            }),
        });
        const createPlaylistData = await createPlaylistResponse.json();
        if (!createPlaylistResponse.ok) {
            console.error("Error creating playlist:", createPlaylistData);
            return res.status(createPlaylistResponse.status).json({ 
                error: createPlaylistData.error || "Failed to create playlist" 
            });
        }
        const playlistId = createPlaylistData.id; 

        // add tracks to new playlist
        const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uris: trackUris,
            }),
        });
        const addTracksData = await addTracksResponse.json();
        if (!addTracksResponse.ok) {
            console.error("Error adding tracks to playlist:", addTracksData);
            return res.status(addTracksResponse.status).json({ 
                error: addTracksData.error || "Failed to add tracks to playlist" 
            });
        }

        
        res.json({ 
            success: true, 
            message: "Playlist created and tracks added successfully!",
            playlistId,
            playlistName
        });
    } catch (error) {
        console.error("Error in /api/create-playlist:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
