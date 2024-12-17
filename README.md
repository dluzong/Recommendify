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
- To start up the app, simply navigate to the root of the project folder and run the `npm i` command to install all the dependencies
- Get credentials for your own .env file on https://developer.spotify.com/dashboard/create (make sure the redirect URI is http://localhost:5001/callback and you are using Web API)
- Next run `npm run both` which concurrently runs `npm run start` and `npm run dev` (the frontend and backend of our application)
- A browser window should automatically open with the URL directed at `http://localhost:3000`, showing the login screen
