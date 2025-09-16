"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  className?: string;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function TestimonialsCarousel({
  testimonials,
  className,
  showDots = true,
  showArrows = true,
  autoPlay = true,
  autoPlayInterval = 5000,
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset to first slide when switching between mobile/desktop
  useEffect(() => {
    setCurrentIndex(0);
  }, [isMobile]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const interval = setInterval(() => {
      if (isMobile) {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      } else {
        // Desktop: show 2 cards at once, cycle through all cards
        setCurrentIndex((prev) => prev >= testimonials.length - 2 ? 0 : prev + 1);
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, testimonials.length, isHovered, isMobile]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    if (isMobile) {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    } else {
      // Desktop: show 2 cards at once, cycle through all cards
      setCurrentIndex((prev) => prev <= 0 ? testimonials.length - 2 : prev - 1);
    }
  };

  const goToNext = () => {
    if (isMobile) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    } else {
      // Desktop: show 2 cards at once, cycle through all cards
      setCurrentIndex((prev) => prev >= testimonials.length - 2 ? 0 : prev + 1);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"
        )}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const renderTestimonialCard = (testimonial: Testimonial) => (
    <div
      key={testimonial.id}
      className="group high-tech-card high-tech-glow high-tech-shimmer high-tech-border rounded-2xl p-4 sm:p-6 md:p-8 h-full border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 mx-2 sm:mx-4 transition-all duration-300"
    >
      <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
        <div className="flex -space-x-1 sm:-space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 shadow-sm bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
          ))}
        </div>
        <div className="ml-2 sm:ml-3 md:ml-4">
          <div className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm md:text-base">
            {testimonial.name}
          </div>
          <div className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
            {testimonial.role}
          </div>
        </div>
      </div>
      <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base mb-3 sm:mb-4">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="flex text-yellow-400">
        {renderStars(testimonial.rating)}
      </div>
    </div>
  );

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl mx-2 sm:mx-4 md:mx-0">
        <div
          className="flex transition-transform duration-500 ease-out"
          // eslint-disable-next-line brand-aware/brand-enforce-components
          style={{
            transform: `translateX(-${currentIndex * (isMobile ? 100 : 50)}%)`,
          }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={cn(
                "flex-shrink-0 py-2",
                isMobile ? "w-full px-1" : "w-1/2 px-2 md:px-4"
              )}
            >
              {renderTestimonialCard(testimonial)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && testimonials.length > 1 && (
        <div className="flex justify-center mt-4 sm:mt-6 space-x-3 sm:space-x-4">
          <button
            onClick={goToPrevious}
            className="p-2 sm:p-2 md:p-3 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={goToNext}
            className="p-2 sm:p-2 md:p-3 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      )}

      {/* Dots Indicator */}
      {showDots && testimonials.length > 1 && (
        <div className="flex justify-center mt-3 sm:mt-4 space-x-1.5 sm:space-x-2">
          {(isMobile ? testimonials : Array.from({ length: Math.max(1, testimonials.length - 1) }, (_, i) => i)).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-gray-900 dark:bg-gray-100 w-4 sm:w-6"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="text-center mt-2 sm:mt-3 text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
        {isMobile 
          ? `${currentIndex + 1} of ${testimonials.length}` 
          : `${currentIndex + 1} of ${Math.max(1, testimonials.length - 1)}`
        }
      </div>
    </div>
  );
}

// Default testimonials data
export const defaultTestimonials: Testimonial[] = [
  {
    id: "sarah-m",
    name: "Sarah M.",
    role: "Salon Owner",
    quote: "The waitlist app was exactly what we needed. Got it in 5 days and it's already helping us fill gaps in our schedule. The booking integration is seamless.",
    rating: 5,
  },
  {
    id: "mike-r",
    name: "Mike R.",
    role: "Real Estate Agent",
    quote: "The listing hub has been a game-changer. Clients can submit info and I get branded pages ready for MLS in minutes. Worth every penny.",
    rating: 5,
  },
  {
    id: "jennifer-l",
    name: "Jennifer L.",
    role: "Gym Owner",
    quote: "The progress tracker keeps our clients engaged and makes my job easier. Automatic weekly reports save me hours every week.",
    rating: 5,
  },
  {
    id: "david-k",
    name: "David K.",
    role: "Restaurant Manager",
    quote: "The reservation system transformed our operations. No more double bookings and customers love the instant confirmations. Highly recommended!",
    rating: 5,
  },
];
