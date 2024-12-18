# Recommendify

## About this project
Recommendify is a web application designed to uncover new music and your next favorite artist. Simply sign in with your Spotify account and Recommendify will give you a list of recommended artists to explore! ✨🎶

### Features: 
- Recommend artists based on user activity
- Display top artists and songs
- Search for songs and artists
    - Create a new playlist based on search results
    - Add a song to an existing playlist
- View playlists, artists, songs on Spotify
- Delete a song from a playlist

## Tech Stack
- Frontend: ReactJS
- Backend: ExpressJS (NodeJS)
- API: SpotifyAPI (https://developer.spotify.com/documentation/web-api)

## Group Members
- Alexon Abreu
- Daphne Luzong
- Humayra Mahboob
- Jake Martin
- Madina Monowara

## Getting Started
1. Create App with Spotify
    -  Navigate to [Spotify developer dashboard](https://developer.spotify.com/dashboard) and log in
    - Click 'Create App' button
    - Fill in the following fields and click save:
    ```
    App Name: Recommendify
    App Description: Testing Recommendify
    Redirect URIs: http://localhost:5001/callback
    Which API/SDKs are you planning to use: Web API
    ```
    - Find Client ID and Client Secret
        - Go to the dashboard for the newly created app 
        - Click on 'Settings'
        - Write down your Client ID and Client Secret
2. Running the App
    - Download the github repo
    - Navigate to the directory of the repo
    - Create a `.env` file in the global directory
        - Inside the `.env` file should be 3 lines: 
        ```
        CLIENT_ID=<your_spotify_client_id>  
        CLIENT_SECRET=<your_spotify_client_secret>  
        REDIRECT_URI=http://localhost:5001/callback
        ``` 
    - Install dependencies: 
        - run the `npm i` command in the root of your project folder
    - Run the server: 
        - run `npm run both`
            -   Concurrently runs `npm run start` and `npm run dev` (the frontend and backend of our application)
    - Navigate to the web page app: http://localhost:3000 
