/**
 * @fileoverview HT-022.2.2: Simple Theme Switcher Component
 * @module components/ui/atomic/theming
 * @author Agency Component System
 * @version 1.0.0
 *
 * SIMPLE THEME SWITCHER: Basic UI for client theme switching
 */

'use client';

import React, { useState } from 'react';
import { useSimpleTheme, type SimpleClientTheme } from './simple-theme-provider';
import { Button } from '../atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../molecules';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../molecules';
import { Badge } from '../atoms';
import { Palette, Settings, Check } from 'lucide-react';

interface ThemeSwitcherProps {
  showCustomization?: boolean;
  className?: string;
}

export function ThemeSwitcher({ showCustomization = false, className }: ThemeSwitcherProps) {
  const { currentTheme, availableThemes, switchTheme, isCustomTheme } = useSimpleTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Selector
        </CardTitle>
        <CardDescription>
          Choose a theme for your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Theme Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Theme</label>
          <Select value={currentTheme.id} onValueChange={switchTheme}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {availableThemes.map(theme => (
                <SelectItem key={theme.id} value={theme.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    {theme.name}
                    {theme.isCustom && <Badge variant="secondary" className="ml-auto">Custom</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Theme Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Preview</label>
          <div className="border rounded-lg p-4 space-y-3">
            {/* Color Swatches */}
            <div className="flex gap-2">
              {Object.entries(currentTheme.colors).map(([name, color]) => (
                <div key={name} className="text-center">
                  <div
                    className="w-8 h-8 rounded border mb-1"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs capitalize">{name}</span>
                </div>
              ))}
            </div>

            {/* Logo Preview */}
            <div className="flex items-center gap-2">
              {currentTheme.logo.src ? (
                <img
                  src={currentTheme.logo.src}
                  alt={currentTheme.logo.alt}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                >
                  {currentTheme.logo.initials}
                </div>
              )}
              <span className="text-sm">{currentTheme.logo.alt}</span>
            </div>

            {/* Typography Preview */}
            <div style={{ fontFamily: currentTheme.typography.fontFamily }}>
              <p className="text-sm">
                Typography: {currentTheme.typography.fontFamily.split(',')[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings className="h-4 w-4 mr-1" />
            {showCustomization ? 'Customize' : 'Options'}
          </Button>

          {isCustomTheme && (
            <Badge variant="secondary" className="ml-auto">
              <Check className="h-3 w-3 mr-1" />
              Custom Theme Active
            </Badge>
          )}
        </div>

        {/* Expanded Options */}
        {isExpanded && showCustomization && (
          <div className="border-t pt-4">
            <ThemeCustomizer />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ThemeCustomizer() {
  const { currentTheme, updateTheme } = useSimpleTheme();
  const [tempTheme, setTempTheme] = useState<Partial<SimpleClientTheme>>({});

  const handleColorChange = (colorKey: string, value: string) => {
    setTempTheme(prev => ({
      ...prev,
      colors: {
        ...currentTheme.colors,
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const applyChanges = () => {
    if (Object.keys(tempTheme).length > 0) {
      updateTheme(tempTheme);
      setTempTheme({});
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Quick Customization</h4>

      {/* Color Customization */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium">Primary Color</label>
          <input
            type="color"
            value={tempTheme.colors?.primary || currentTheme.colors.primary}
            onChange={(e) => handleColorChange('primary', e.target.value)}
            className="w-full h-8 rounded border"
          />
        </div>
        <div>
          <label className="text-xs font-medium">Secondary Color</label>
          <input
            type="color"
            value={tempTheme.colors?.secondary || currentTheme.colors.secondary}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
            className="w-full h-8 rounded border"
          />
        </div>
      </div>

      {/* Logo Initials */}
      <div>
        <label className="text-xs font-medium">Logo Initials</label>
        <input
          type="text"
          maxLength={2}
          value={tempTheme.logo?.initials || currentTheme.logo.initials}
          onChange={(e) => setTempTheme(prev => ({
            ...prev,
            logo: {
              ...currentTheme.logo,
              ...prev.logo,
              initials: e.target.value.toUpperCase()
            }
          }))}
          className="w-full h-8 px-2 rounded border text-center"
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={applyChanges}>
          Apply Changes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTempTheme({})}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}