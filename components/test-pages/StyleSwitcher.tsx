/**
 * @fileoverview HT-012.3.1: Style Switcher Component
 * @module components/test-pages/StyleSwitcher
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ui/button';
import { Card, CardContent } from '@ui/card';
import { Badge } from '@ui/badge';
import { ChevronLeft, ChevronRight, Eye, Zap, Star } from 'lucide-react';
import Link from 'next/link';

interface StyleOption {
  id: string;
  name: string;
  description: string;
  route: string;
  preview: string;
  metrics: {
    visualAppeal: number;
    brandAlignment: number;
    mobileExperience: number;
    accessibility: number;
    modernFeel: number;
    professionalAppearance: number;
  };
  pros: string[];
  cons: string[];
}

interface StyleSwitcherProps {
  styles: StyleOption[];
  currentStyle: string;
  onStyleChange: (styleId: string) => void;
  showMetrics?: boolean;
  compact?: boolean;
}

export function StyleSwitcher({ 
  styles, 
  currentStyle, 
  onStyleChange, 
  showMetrics = true,
  compact = false 
}: StyleSwitcherProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const index = styles.findIndex(style => style.id === currentStyle);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentStyle, styles]);

  const nextStyle = () => {
    const nextIndex = (currentIndex + 1) % styles.length;
    setCurrentIndex(nextIndex);
    onStyleChange(styles[nextIndex].id);
  };

  const prevStyle = () => {
    const prevIndex = currentIndex === 0 ? styles.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    onStyleChange(styles[prevIndex].id);
  };

  const calculateOverallScore = (style: StyleOption): number => {
    const metrics = Object.values(style.metrics);
    return Math.round(metrics.reduce((sum, score) => sum + score, 0) / metrics.length);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 9) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={prevStyle}
          disabled={styles.length <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <span className="font-medium text-sm truncate">
            {styles[currentIndex]?.name}
          </span>
          {showMetrics && (
            <Badge variant="outline" className={getScoreColor(calculateOverallScore(styles[currentIndex]))}>
              {calculateOverallScore(styles[currentIndex])}/10
            </Badge>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextStyle}
          disabled={styles.length <= 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        <Link href={styles[currentIndex]?.route || '#'}>
          <Button size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Style Display */}
      <Card className="overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-300 rounded-lg mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Live Preview</p>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{styles[currentIndex]?.name}</h3>
            {showMetrics && (
              <Badge className={getScoreColor(calculateOverallScore(styles[currentIndex]))}>
                {calculateOverallScore(styles[currentIndex])}/10
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {styles[currentIndex]?.description}
          </p>
          
          {/* Quick Metrics */}
          {showMetrics && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-center mb-1">
                  <Eye className="w-3 h-3 text-blue-500" />
                </div>
                <div className="text-xs font-medium">
                  {styles[currentIndex]?.metrics.visualAppeal}/10
                </div>
                <div className="text-xs text-gray-500">Visual</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                </div>
                <div className="text-xs font-medium">
                  {styles[currentIndex]?.metrics.brandAlignment}/10
                </div>
                <div className="text-xs text-gray-500">Brand</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="w-3 h-3 text-green-500" />
                </div>
                <div className="text-xs font-medium">
                  {styles[currentIndex]?.metrics.modernFeel}/10
                </div>
                <div className="text-xs text-gray-500">Modern</div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Link href={styles[currentIndex]?.route || '#'} className="flex-1">
              <Button className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Full Style
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStyle}
          disabled={styles.length <= 1}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        
        <div className="flex items-center space-x-2">
          {styles.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                onStyleChange(styles[index].id);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={nextStyle}
          disabled={styles.length <= 1}
          className="flex items-center space-x-2"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Style List */}
      <div className="grid grid-cols-2 gap-2">
        {styles.map((style, index) => (
          <button
            key={style.id}
            onClick={() => {
              setCurrentIndex(index);
              onStyleChange(style.id);
            }}
            className={`p-3 text-left rounded-lg border transition-colors ${
              index === currentIndex
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-sm">{style.name}</div>
            {showMetrics && (
              <div className="text-xs text-gray-500 mt-1">
                Score: {calculateOverallScore(style)}/10
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface StylePreviewProps {
  style: StyleOption;
  isActive: boolean;
  onClick: () => void;
  showMetrics?: boolean;
}

export function StylePreview({ style, isActive, onClick, showMetrics = true }: StylePreviewProps) {
  const calculateOverallScore = (style: StyleOption): number => {
    const metrics = Object.values(style.metrics);
    return Math.round(metrics.reduce((sum, score) => sum + score, 0) / metrics.length);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 9) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">Preview</p>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm">{style.name}</h4>
          {showMetrics && (
            <Badge variant="outline" className={getScoreColor(calculateOverallScore(style))}>
              {calculateOverallScore(style)}/10
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">
          {style.description}
        </p>
      </CardContent>
    </Card>
  );
}
