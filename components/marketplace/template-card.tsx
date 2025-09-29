/**
 * @fileoverview Template Card Component - HT-032.3.1
 * @module components/marketplace/template-card
 * @author HT-032.3.1 - Template Marketplace Infrastructure & Discovery Platform
 * @version 1.0.0
 *
 * HT-032.3.1: Template Marketplace Infrastructure & Discovery Platform
 *
 * Template card component for displaying individual templates in both
 * grid and list views with interactive features and detailed information.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, Download, Eye, Heart, ExternalLink, Play, ShoppingCart,
  Check, Verified, Clock, DollarSign, Users, Sparkles, TrendingUp
} from 'lucide-react';
import type { MarketplaceTemplate } from '@/lib/marketplace/discovery-platform';

export interface TemplateCardProps {
  template: MarketplaceTemplate;
  viewMode?: 'grid' | 'list';
  isSelected?: boolean;
  isFavorite?: boolean;
  showAuthor?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  onFavorite?: () => void;
  onInstall?: () => void;
  className?: string;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  viewMode = 'grid',
  isSelected = false,
  isFavorite = false,
  showAuthor = true,
  showStats = true,
  showActions = true,
  onSelect,
  onPreview,
  onFavorite,
  onInstall,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on buttons or links
    if ((e.target as HTMLElement).closest('button, a')) {
      return;
    }
    onSelect?.();
  };

  const nextScreenshot = () => {
    if (template.screenshots.length > 1) {
      setCurrentScreenshot((prev) => (prev + 1) % template.screenshots.length);
    }
  };

  const prevScreenshot = () => {
    if (template.screenshots.length > 1) {
      setCurrentScreenshot((prev) => 
        prev === 0 ? template.screenshots.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'Free';
    return `$${price}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderScreenshots = () => {
    if (!template.screenshots || template.screenshots.length === 0) {
      return (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <Eye className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No preview</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full group">
        <Image
          src={template.screenshots[currentScreenshot]}
          alt={`${template.name} screenshot ${currentScreenshot + 1}`}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-template.png';
          }}
        />

        {/* Screenshot Navigation */}
        {template.screenshots.length > 1 && isHovered && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevScreenshot();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextScreenshot();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Screenshot Indicators */}
        {template.screenshots.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {template.screenshots.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentScreenshot(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentScreenshot ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Overlay Actions */}
        {isHovered && showActions && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              {template.demoUrl && (
                <Button size="sm" variant="secondary" asChild>
                  <a href={template.demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Demo
                  </a>
                </Button>
              )}
              {template.videoUrl && (
                <Button size="sm" variant="secondary" asChild>
                  <a href={template.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Play className="w-4 h-4 mr-1" />
                    Video
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {template.isFeatured && (
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {template.isPopular && (
            <Badge className="bg-orange-500 text-white">
              <TrendingUp className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={template.isFree ? "secondary" : "default"}
            className={template.isFree ? "bg-green-100 text-green-800" : "bg-blue-600 text-white"}
          >
            {formatPrice(template.price, template.isFree)}
          </Badge>
        </div>

        {/* Favorite Button */}
        {showActions && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.();
            }}
            className="absolute top-2 right-12 bg-white/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <Heart 
              className={`w-4 h-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} 
            />
          </button>
        )}
      </div>
    );
  };

  const renderGridView = () => (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Screenshot */}
      <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
        {renderScreenshots()}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-1" title={template.name}>
              {template.name}
            </CardTitle>
            <CardDescription className="line-clamp-2" title={template.description}>
              {template.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Stats */}
        {showStats && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{template.rating.toFixed(1)}</span>
              <span className="text-xs">({template.reviews.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{formatNumber(template.downloads)}</span>
            </div>
          </div>
        )}

        {/* Author */}
        {showAuthor && (
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={template.author.avatar} />
              <AvatarFallback className="text-xs">
                {template.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">
              {template.author.name}
              {template.author.verified && (
                <Verified className="w-3 h-3 text-blue-500 inline ml-1" />
              )}
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onInstall?.();
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {template.isFree ? 'Install' : 'Purchase'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.();
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderListView = () => (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex">
        {/* Screenshot */}
        <div className="w-48 h-32 bg-muted overflow-hidden rounded-l-lg flex-shrink-0">
          {renderScreenshots()}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold line-clamp-1" title={template.name}>
                {template.name}
              </h3>
              <p className="text-muted-foreground line-clamp-2" title={template.description}>
                {template.description}
              </p>
            </div>
            <div className="ml-4 text-right">
              <div className="text-lg font-bold">
                {formatPrice(template.price, template.isFree)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
            {showStats && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating.toFixed(1)}</span>
                  <span>({template.reviews.length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{formatNumber(template.downloads)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(template.lastUpdated).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Author */}
              {showAuthor && (
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={template.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {template.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {template.author.name}
                    {template.author.verified && (
                      <Verified className="w-3 h-3 text-blue-500 inline ml-1" />
                    )}
                  </span>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 4).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 4}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite?.();
                  }}
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      isFavorite ? 'fill-red-500 text-red-500' : ''
                    }`} 
                  />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview?.();
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInstall?.();
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {template.isFree ? 'Install' : 'Purchase'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return viewMode === 'grid' ? renderGridView() : renderListView();
};

export default TemplateCard;
