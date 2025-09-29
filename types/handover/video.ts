export interface VideoConfig {
  resolution: string;
  framerate: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'mp4' | 'webm' | 'avi' | 'mov';
  transitions?: boolean;
  voiceover?: string;
  subtitles?: boolean;
}

export interface VideoSegment {
  id: string;
  type: 'screenshot' | 'recording' | 'animation' | 'slide';
  duration: number;
  content: {
    title: string;
    description: string;
    assets: string[];
  };
  transitions: {
    in: VideoTransition;
    out: VideoTransition;
  };
  timing: {
    start: number;
    end: number;
  };
  effects?: VideoEffect[];
  annotations?: VideoAnnotation[];
}

export interface VideoTransition {
  type: 'fade' | 'slide' | 'wipe' | 'dissolve' | 'cut';
  direction?: 'in' | 'out' | 'left' | 'right' | 'up' | 'down';
  duration: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface VideoEffect {
  type: 'zoom' | 'pan' | 'highlight' | 'blur' | 'spotlight';
  parameters: Record<string, any>;
  timing: {
    start: number;
    duration: number;
  };
}

export interface VideoAnnotation {
  type: 'text' | 'arrow' | 'highlight' | 'callout';
  content: string;
  position: {
    x: number;
    y: number;
  };
  timing: {
    start: number;
    duration: number;
  };
  style: {
    color?: string;
    fontSize?: number;
    fontWeight?: string;
    backgroundColor?: string;
    borderColor?: string;
  };
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  walkthroughId: string;
  config: VideoConfig;
  format: string;
  resolution: string;
  framerate: number;
  quality: string;
  language: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}