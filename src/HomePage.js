import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from './ProfileContext';
import './HomePage.css';

function HomePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [recommendedArtists, setRecommendedArtists] = useState(null);
    const [images, setImages] = useState(null);

    const { displayName, profileImage } = useProfile();
    
    const handleDotClick = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        if (searchQuery.trim() !== '') {
            const storedToken = localStorage.getItem("spotify_token");
            navigate(`/search?query=${searchQuery}&access_token=${storedToken}`);
        } else {
            alert('Please enter a search term');
        }
    };
    
    useEffect(() => {
        const tokenParams = new URLSearchParams(location.search);
        const accessToken = tokenParams.get("access_token");
        if (accessToken) {
            localStorage.setItem("spotify_token", accessToken);
            window.history.replaceState({}, document.title, location.pathname);
    
            fetch("http://localhost:5001/api/recommend-artists", {
                headers: {
                    Authorization: accessToken,
                },
            })
                .then((res) => res.json())
                .then((data) => setRecommendedArtists(data))
                .catch((err) => console.error("Error fetching top artists:", err));

            fetch("http://localhost:5001/api/recommend-songs", {
                headers: {
                    Authorization: accessToken,
                },
            })
                .then((res) => res.json())
                .then((data) => setImages(data))
                .catch((err) => console.error("Error fetching top artists:", err));
        } else {
            window.location.href = "http://localhost:5001/login";
        }
    }, []);


    // const images = [
    //     { src: "https://www.billboard.com/wp-content/uploads/media/02-the-weeknd-press-2019-cr-Nabil-Elderkin-billboard-1548.jpg?w=1024", title: "The Weeknd - Blinding Lights" },
    //     { src: "https://www.billboard.com/wp-content/uploads/2022/05/bad-bunny-cover-art-2022-billboard-1240.jpg", title: "Bad Bunny - Después de la Playa" },
    //     { src: "https://cdn-images.dzcdn.net/images/cover/ed3944c139089af1359c26d78843d435/0x1900-000000-80-0-0.jpg", title: "CKay - Love Nwantiti" },
    //     { src: "https://media.pitchfork.com/photos/638902d2e5592afa444298b9/master/w_1600%2Cc_limit/SZA-SOS.jpg", title: "SZA - Too Late" },
    //     { src: "https://preview.redd.it/every-ariana-grande-album-and-ep-cover-art-in-very-high-v0-dhx14du2o8ob1.jpg?width=3600&format=pjpg&auto=webp&s=056e757d011823e2f4c96c22c9c8c331fa7c03a0", title: "Ariana Grande - Side To Side " },
    // ];

    // const recommendedArtists = [
    //     { name: "Tyla", genre: "Afropop", image: "https://media.vanityfair.com/photos/66198fc554db4652985baf00/4:3/w_1600,h_1200,c_limit/202405-van-opener-tyla01.jpg" },
    //     { name: "Taylor Swift", genre: "Pop", image: "https://i.pinimg.com/236x/69/79/7d/69797d9bfaa93754379a67b845293ea4.jpg" },
    //     { name: "Gunna", genre: "Hip hop", image: "https://lastfm.freetls.fastly.net/i/u/ar0/e9e2fd205737226a77f3a5519e5b33cb.jpg" },
    //     { name: "Daft Punk", genre: "Electronic", image: "https://imgproxy.ra.co/_/quality:66/aHR0cHM6Ly9zdGF0aWMucmEuY28vaW1hZ2VzL3Byb2ZpbGVzL2xnL2RhZnRwdW5rLmpwZz9kYXRlVXBkYXRlZD0xNTk4MzkxMzc5MDAw" },
    //     { name: "Beyoncé", genre: "R&B", image: "https://metro.co.uk/wp-content/uploads/2023/03/SEI_148621909-b014.jpg?quality=90&strip=all&w=646" },
    //     { name: "The Rolling Stones", genre: "Rock", image: "https://cdn.britannica.com/41/197341-050-4859B808/The-Rolling-Stones-Bill-Wyman-Keith-Richards-1964.jpg" }
    // ];

    return (
        <div className="home-page">
            <header className="header">
                <div className="logo">Recommendify</div>
                <div className="search-bar-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                    />
                    <span className="magnifying-glass" onClick={handleSearchSubmit}>🔍</span>
                </div>
                <button className="logout-button">Logout</button>
                <div className="profile-picture">
                    <Link to={"/profile"}>
                        <img src={profileImage} alt="Profile" />
                    </Link>
                </div>
            </header>

            <main className="recommended-section">
            <h2>Top Songs</h2>
                <div className="line"></div>
                <div className="carousel-container">
                    <button className="carousel-button left" onClick={goToPrevious}>
                        ❮
                    </button>
                    <div className="carousel">
                        {images ? (
                            images.map((image, index) => {
                                let position = "hidden"; // Default state

                                if (index === currentIndex) {
                                    position = "active"; // Current image is active
                                } else if (index === (currentIndex - 1 + images.length) % images.length) {
                                    position = "prev"; // Previous image
                                } else if (index === (currentIndex + 1) % images.length) {
                                    position = "next"; // Next image
                                }

                                return (
                                    <div className={`carousel-item ${position}`} key={index}>
                                        <img src={image.src} alt={image.title} />
                                        <p className="song-title">{image.title}</p>
                                        {/* <button className="add-button">+</button> */}
                                    </div>
                                );
                            })
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>
                    <button className="carousel-button right" onClick={goToNext}>
                        ❯
                    </button>
                </div>
                <div className="carousel-dots">
                    {images ? (
                        images.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${currentIndex === index ? "active" : ""}`}
                                onClick={() => handleDotClick(index)}
                            ></span>
                        ))
                    ) : (
                        <span className="dot">...</span>
                    )}
                </div>

                <h2 className="artists-heading">Recommended Artists</h2>
                <div className="line"></div>
                <div className="artists-grid">
                {recommendedArtists ? (
                    recommendedArtists.map((artist, index) => (
                        <div key={index} className="artist-card">
                            <div className="artist-image-container">
                                <img src={artist.image} alt={artist.name} className="artist-image" />
                            </div>
                            <h3 className="artist-name">{artist.name}</h3>
                            <p className="artist-genre">{artist.genre}</p>
                        </div>
                    ))
                ) : (
                    <p>Loading recommended artists...</p>
                )}
            </div>
            </main>
        </div>
    );
}

export default HomePage;
