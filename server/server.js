var express = require('express');
var cors = require('cors');
var querystring = require('querystring');
 

require("dotenv").config();

const app = express();
app.use(express.static(__dirname + '/public'))
   .use(cors());

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
    const authUrl = "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
            response_type: "code",
            client_id: CLIENT_ID,
            scope: "user-read-private user-read-email",
            redirect_uri: REDIRECT_URI,
            prompt: "login"
        });
    res.redirect(authUrl);
});


app.get("/callback", async (req, res) => {
    console.log("callback route...")
    const code = req.query.code || null; // The code returned by Spotify after user logs in
    if (!code) {
        return res.status(400).send("No code received from Spotify");
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
            res.json(data.tracks.items);  // Send back the list of tracks
        } else {
            res.status(response.status).json({ error: "Error fetching search results from Spotify" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch search results" });
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});