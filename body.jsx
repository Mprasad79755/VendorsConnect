import React, { useState } from 'react';
import './body.css'; // Add your custom styles in a separate CSS file for better management
import Header from '../components/header';
import Footer from './footer';

const AppBody = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    'https://via.placeholder.com/800x300/6a11cb/2575fc?text=Welcome+to+Our+App',
    'https://via.placeholder.com/800x300/2575fc/6a11cb?text=Discover+New+Experiences',
    'https://via.placeholder.com/800x300/ff7e5f/6a11cb?text=Get+Exclusive+Offers',
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  return (
    <>
    <div className="app-body">
        <Header></Header>
      {/* Slideshow */}
      <div className="slideshow-container">
        <div className="slide" style={{ backgroundImage: `url(${slides[currentSlide]})` }}>
          <div className="slide-content">
            <h2>Welcome to Our App!</h2>
            <p>Discover amazing features and offers tailored just for you.</p>
          </div>
        </div>
        <button className="slide-nav prev" onClick={handlePrevSlide}>
          &#10094;
        </button>
        <button className="slide-nav next" onClick={handleNextSlide}>
          &#10095;
        </button>
      </div>

      {/* Text in Center */}
      <div className="center-text">
        <h1>Welcome Back, User!</h1>
        <p>Your favorite food, now delivered in seconds.</p>
        <button className="cta-btn">Explore Now</button>
      </div>
    </div>
<Footer></Footer>
    </>
  );
};
export default AppBody;
