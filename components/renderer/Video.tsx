/**
 * Video Component
 * 
 * Displays an embedded video player
 */

import React from 'react';

interface VideoProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
}

const Video: React.FC<VideoProps> = ({
  src,
  poster,
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <video
        className="w-full h-auto rounded-lg shadow-lg"
        controls={controls}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        poster={poster}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Video;
