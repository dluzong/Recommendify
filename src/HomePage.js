import React, { useState } from 'react';
import './HomePage.css';

function HomePage() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const images = [
        { src: "/assets/LaurynAdjusted.png", title: "Song 1" },
        { src: "/assets/tyadjusted2.png", title: "Song 2" },
        { src: "/assets/BillieAdjusted.png", title: "Song 3" },
        { src: "/assets/DrakeAdjusted.png", title: "Song 4" },
        { src: "/assets/ArianaAdjusted.png", title: "Song 5" },
    ];

    const handleDotClick = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <div className="home-page">
            <header className="header">
                <div className="logo">Recommendify</div>
                <div className="search-bar-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search..."
                    />
                    <span className="magnifying-glass">🔍</span>
                </div>
                <button className="logout-button">Logout</button>
                <div className="profile-picture">
                    <img src="/assets/ProfilePic.avif" alt="Profile" />
                </div>
            </header>

            <main className="recommended-section">
                <h2>Recommended Songs</h2>
                <div className="line"></div>
                <div className="carousel-container">
                    <button className="carousel-button left" onClick={goToPrevious}>
                        ❮
                    </button>
                    <div className="carousel">
                        {images.map((image, index) => (
                            <div
                                className={`carousel-item ${
                                    index === currentIndex
                                        ? "active"
                                        : index === (currentIndex - 1 + images.length) % images.length
                                        ? "prev"
                                        : index === (currentIndex + 1) % images.length
                                        ? "next"
                                        : "hidden"
                                }`}
                                key={index}
                            >
                                <img src={image.src} alt={image.title} />
                                <p className="song-title">{image.title}</p>
                            </div>
                        ))}
                    </div>
                    <button className="carousel-button right" onClick={goToNext}>
                        ❯
                    </button>
                </div>
                <div className="carousel-dots">
                    {images.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${currentIndex === index ? "active" : ""}`}
                            onClick={() => handleDotClick(index)}
                        ></span>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default HomePage;
