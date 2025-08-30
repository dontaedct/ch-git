/**
 * Enhanced consent components for privacy compliance
 * Task 18: Privacy/consent + audit log
 */

"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Shield, Mail, Eye } from "lucide-react";

export interface ConsentConfig {
  type: "marketing" | "privacy" | "analytics";
  title: string;
  description: string;
  required: boolean;
  version: string;
  text: string;
  learnMoreUrl?: string;
}

export interface ConsentFormProps {
  configs: ConsentConfig[];
  onSubmit: (consents: Record<string, boolean>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function ConsentForm({ configs, onSubmit, onCancel, loading = false }: ConsentFormProps) {
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleConsentChange = (type: string, checked: boolean) => {
    setConsents(prev => ({ ...prev, [type]: checked }));
    // Clear error when user makes a choice
    if (errors[type]) {
      setErrors(prev => ({ ...prev, [type]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required consents
    const newErrors: Record<string, string> = {};
    configs.forEach(config => {
      if (config.required && !consents[config.type]) {
        newErrors[config.type] = "This consent is required to continue";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(consents);
    } catch (error) {
      console.error("Consent submission failed:", error);
    }
  };

  const getConsentIcon = (type: string) => {
    switch (type) {
      case "marketing":
        return <Mail className="w-4 h-4" />;
      case "privacy":
        return <Shield className="w-4 h-4" />;
      case "analytics":
        return <Eye className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {configs.map((config) => (
          <Card key={config.type} className={`${errors[config.type] ? 'border-red-200' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {getConsentIcon(config.type)}
                <CardTitle className="text-lg">{config.title}</CardTitle>
                {config.required && (
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                )}
                <Badge variant="outline" className="text-xs">v{config.version}</Badge>
              </div>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {config.text}
              </div>
              
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`consent-${config.type}`}
                  checked={consents[config.type] || false}
                  onCheckedChange={(checked) => handleConsentChange(config.type, checked as boolean)}
                  disabled={loading}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`consent-${config.type}`}
                    className="text-sm font-medium leading-relaxed cursor-pointer"
                  >
                    I agree to the {config.title.toLowerCase()} terms
                    {config.learnMoreUrl && (
                      <a 
                        href={config.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 ml-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Learn more</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  {errors[config.type] && (
                    <p className="text-sm text-red-600 mt-1">{errors[config.type]}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Processing..." : "Accept & Continue"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export interface ConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  onLearnMore: () => void;
  loading?: boolean;
}

export function ConsentBanner({ onAccept, onDecline, onLearnMore, loading = false }: ConsentBannerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              We use cookies and similar technologies to provide you with the best experience. 
              By continuing to use our site, you agree to our{" "}
              <button 
                type="button"
                onClick={onLearnMore}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDecline}
              disabled={loading}
            >
              Decline
            </Button>
            <Button 
              size="sm" 
              onClick={onAccept}
              disabled={loading}
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ConsentToggleProps {
  type: string;
  title: string;
  description: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}

export function ConsentToggle({ 
  type, 
  title, 
  description, 
  checked, 
  onToggle, 
  disabled = false 
}: ConsentToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <Checkbox
        id={`consent-toggle-${type}`}
        checked={checked}
        onCheckedChange={(checked) => onToggle(checked as boolean)}
        disabled={disabled}
      />
    </div>
  );
}
