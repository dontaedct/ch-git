"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileCarouselProps {
  children: React.ReactNode[];
  className?: string;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function MobileCarousel({
  children,
  className,
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 7000,
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-play functionality with reset capability
  const startAutoPlay = () => {
    if (!autoPlay || isHovered) return; // Removed isMobile check to enable desktop auto-play
    
    // Clear existing interval
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    
    // Start new interval
    autoPlayRef.current = setInterval(() => {
      if (isMobile) {
        setCurrentIndex((prev) => (prev + 1) % children.length);
      } else {
        // Desktop: show 2 cards at once, cycle through all cards
        const maxIndex = Math.max(0, children.length - 2);
        setCurrentIndex((prev) => prev >= maxIndex ? 0 : prev + 1);
      }
    }, autoPlayInterval);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const resetAutoPlay = () => {
    stopAutoPlay();
    startAutoPlay();
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [autoPlay, autoPlayInterval, children.length, isHovered]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    resetAutoPlay(); // Reset auto-play when user starts interacting
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isMobile) return;
    
    const deltaX = currentX - startX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe right - go to previous
        setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
      } else {
        // Swipe left - go to next
        setCurrentIndex((prev) => (prev + 1) % children.length);
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    resetAutoPlay(); // Reset auto-play when user starts interacting
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe right - go to previous (wrap around)
        const maxIndex = Math.max(0, children.length - 2);
        setCurrentIndex((prev) => prev <= 0 ? maxIndex : prev - 1);
      } else {
        // Swipe left - go to next (wrap around)
        const maxIndex = Math.max(0, children.length - 2);
        setCurrentIndex((prev) => prev >= maxIndex ? 0 : prev + 1);
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    resetAutoPlay(); // Reset auto-play when user navigates
  };

  const goToPrevious = () => {
    if (isMobile) {
      setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
    } else {
      // Desktop: wrap around to end when at beginning
      const maxIndex = Math.max(0, children.length - 2);
      setCurrentIndex((prev) => prev <= 0 ? maxIndex : prev - 1);
    }
    resetAutoPlay(); // Reset auto-play when user navigates
  };

  const goToNext = () => {
    if (isMobile) {
      setCurrentIndex((prev) => (prev + 1) % children.length);
    } else {
      // Desktop: wrap around to beginning when at end
      const maxIndex = Math.max(0, children.length - 2);
      setCurrentIndex((prev) => prev >= maxIndex ? 0 : prev + 1);
    }
    resetAutoPlay(); // Reset auto-play when user navigates
  };

  // Don't render carousel on desktop - show grid instead
  if (!isMobile) {
    return (
      <div className={cn("relative", className)}>
        {/* Desktop Carousel Container */}
        <div
          ref={carouselRef}
          className="relative overflow-hidden rounded-2xl"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseUp();
          }}
        >
          {/* Slides Container */}
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${currentIndex * 50}%)`, // Show 2 cards at once (50% per slide)
            }}
          >
            {children.map((child, index) => (
            <div
              key={index}
              className="w-1/2 flex-shrink-0 px-4 py-2 h-full" // Each card takes 50% width
            >
                {child}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - Bottom */}
        {showArrows && children.length > 1 && (
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={goToPrevious}
              className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={goToNext}
              className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        )}

        {/* Dots Indicator */}
        {showDots && children.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {children.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentIndex
                    ? "bg-gray-900 dark:bg-gray-100 w-6"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide Counter */}
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          {isMobile ? `${currentIndex + 1} of ${children.length}` : `${currentIndex + 1} of ${Math.max(1, children.length - 1)}`}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="relative overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseUp();
        }}
      >
        {/* Slides Container */}
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 px-4 py-2 h-full"
            >
              {child}
            </div>
          ))}
        </div>

      </div>

      {/* Navigation Arrows - Bottom */}
      {showArrows && children.length > 1 && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={goToPrevious}
            className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={goToNext}
            className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      )}

      {/* Dots Indicator */}
      {showDots && children.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-gray-900 dark:bg-gray-100 w-6"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        {currentIndex + 1} of {children.length}
      </div>
    </div>
  );
}

// Individual slide wrapper component
export function CarouselSlide({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full h-full", className)}>
      {children}
    </div>
  );
}
