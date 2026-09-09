// src/components/Home/TrustedPartners.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award } from 'lucide-react';

// Import partner logos
import ecoLogo from '../../assets/eco.webp';
import elepaqLogo from '../../assets/elepaq2.png';
import jinkoLogo from '../../assets/jinko2.png';
import kiporLogo from '../../assets/kipor.webp';
import nexusLogo from '../../assets/nexus.png';
import perkinsLogo from '../../assets/perkins.png';
import pylontechLogo from '../../assets/pylontech.webp';

const TrustedPartners = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const partners = [
    { name: 'ECO', logo: ecoLogo },
    { name: 'Elepaq', logo: elepaqLogo },
    { name: 'Jinko Solar', logo: jinkoLogo },
    { name: 'Kipor', logo: kiporLogo },
    { name: 'Nexus', logo: nexusLogo },
    { name: 'Perkins', logo: perkinsLogo },
    { name: 'Pylontech', logo: pylontechLogo }
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === partners.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, partners.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? partners.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === partners.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlaying(false);
  };

  // Get visible partners based on screen size
  const getVisiblePartners = () => {
    const visibleCount = 5; // Show 5 logos at a time
    const visible = [];
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % partners.length;
      visible.push(partners[index]);
    }
    
    return visible;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-secondary px-4 py-2 rounded-full font-medium mb-4">
            <Award className="w-4 h-4" />
            Our Partners
          </div>
          <h2 className="text-3xl lg:text-4xl font-medium text-gray-900 mb-4">
            Trusted Partners
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We collaborate with world-class brands to deliver exceptional quality and reliability
          </p>
        </div>

        {/* Desktop View - Show 5 logos */}
        <div className="hidden md:block relative">
          <div className="grid grid-cols-5 gap-3 items-center">
            {getVisiblePartners().map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="aspect-square flex items-center justify-center">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="max-w-full max-h-full object-contain transition-all duration-300 transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="text-gray-400 text-center font-medium text-xs">${partner.name}</div>`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 hover:text-secondary transition-all duration-300 hover:scale-110 border border-gray-200"
            aria-label="Previous partners"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 hover:text-secondary transition-all duration-300 hover:scale-110 border border-gray-200"
            aria-label="Next partners"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile View - Show 2 logos */}
        <div className="md:hidden relative">
          <div className="grid grid-cols-2 gap-3">
            {getVisiblePartners().slice(0, 2).map((partner, index) => (
              <div
                key={`${partner.name}-mobile-${index}`}
                className="group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                <div className="aspect-square flex items-center justify-center">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="max-w-full max-h-full object-contain transition-all duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="text-gray-400 text-center font-medium text-xs">${partner.name}</div>`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={goToPrevious}
              className="w-9 h-9 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 hover:text-secondary transition-all duration-300"
              aria-label="Previous partners"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              className="w-9 h-9 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 hover:text-secondary transition-all duration-300"
              aria-label="Next partners"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {partners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-6 h-2 bg-secondary'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to partner ${index + 1}`}
            />
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-200">
            <Award className="w-4 h-4 text-secondary" />
            <span className="text-gray-700 font-medium text-sm">
              Partnering with industry leaders since 2010
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-2xl font-medium text-secondary mb-1">15+</div>
            <div className="text-gray-600 font-medium text-sm">Years of Partnership</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-2xl font-medium text-secondary mb-1">7</div>
            <div className="text-gray-600 font-medium text-sm">Global Brands</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-2xl font-medium text-secondary mb-1">100%</div>
            <div className="text-gray-600 font-medium text-sm">Authorized Dealers</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedPartners;