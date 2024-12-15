// This file retrieves user data using React Context to be reused across components.

import React, { createContext, useContext, useState, useEffect } from "react";

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({children}) => {
    const [profileData, setProfileData] = useState({
        displayName: "{username}",
        profileImage: "/assets/ProfilePic.avif", // default profile picture
    })

    const fetchUserProfile = async () => {
        const token = localStorage.getItem("spotify_token");
        if (!token) {
            console.error("Spotify token is missing.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/api/spotify-profile", {
                headers: {
                    Authorization: token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const profileImage = data.images && data.images[0] ? data.images[0].url : "/assets/ProfilePic.avif";
                setProfileData({
                    displayName: data.display_name || "User Name",
                    profileImage,
                });
            } else {
                console.error("Failed to fetch profile data:", await response.json());
            }
        } catch (error) {
            console.error("Error fetching user profile:", error.message);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    return (
        <ProfileContext.Provider value={profileData}>
            {children}
        </ProfileContext.Provider>
    );
};