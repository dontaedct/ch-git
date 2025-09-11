/**
 * Consent Management Page
 * Task 18: Privacy/consent + audit log
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsentToggle } from "@/components/consent";
import { Shield, Mail, Eye, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ConsentStatus {
  privacy: boolean;
  marketing: boolean;
  analytics: boolean;
  lastUpdated: string;
  version: string;
}

export default function ConsentManagementPage() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>({
    privacy: true,
    marketing: false,
    analytics: false,
    lastUpdated: new Date().toISOString(),
    version: "1.0"
  });
  const [saving, setSaving] = useState(false);

  const handleConsentToggle = async (type: string, checked: boolean) => {
    setSaving(true);
    try {
      // In a real implementation, this would call an API to update consent
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setConsentStatus(prev => ({
        ...prev,
        [type]: checked,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Failed to update consent:", error);
    } finally {
      setSaving(false);
    }
  };

  const consentConfigs = [
    {
      type: "privacy",
      title: "Privacy Policy",
      description: "Required for using our services. Cannot be disabled.",
      checked: consentStatus.privacy,
      disabled: true
    },
    {
      type: "marketing",
      title: "Marketing Communications",
      description: "Receive updates about our services, promotions, and educational content.",
      checked: consentStatus.marketing,
      disabled: false
    },
    {
      type: "analytics",
      title: "Analytics & Performance",
      description: "Help us improve our services by collecting usage data.",
      checked: consentStatus.analytics,
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
            <Shield className="w-8 h-8 text-gray-900 dark:text-gray-100" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy & Consent Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your privacy preferences and consent choices
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline">Version {consentStatus.version}</Badge>
            <Badge variant="outline">
              Last updated: {new Date(consentStatus.lastUpdated).toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {/* Consent Toggles */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Consent Preferences</CardTitle>
            <CardDescription>
              Control how we use your information and communicate with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {consentConfigs.map((config) => (
              <ConsentToggle
                key={config.type}
                type={config.type}
                title={config.title}
                description={config.description}
                checked={config.checked}
                onToggle={(checked) => handleConsentToggle(config.type, checked)}
                disabled={config.disabled || saving}
              />
            ))}
          </CardContent>
        </Card>

        {/* Consent History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Consent History</CardTitle>
            <CardDescription>
              Track your consent decisions over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Privacy Policy Agreement</p>
                    <p className="text-xs text-gray-500">Version 1.0</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(consentStatus.lastUpdated).toLocaleDateString()}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Marketing Communications</p>
                    <p className="text-xs text-gray-500">Version 1.0</p>
                  </div>
                </div>
                <Badge variant={consentStatus.marketing ? "default" : "secondary"} className="text-xs">
                  {consentStatus.marketing ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Analytics & Performance</p>
                    <p className="text-xs text-gray-500">Version 1.0</p>
                  </div>
                </div>
                <Badge variant={consentStatus.analytics ? "default" : "secondary"} className="text-xs">
                  {consentStatus.analytics ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Data Rights</CardTitle>
            <CardDescription>
              You have the right to access, modify, and delete your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Access Your Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Request a copy of all personal information we hold about you.
                </p>
                <Button variant="outline" size="sm">
                  Request Data Export
                </Button>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Delete Your Account</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Permanently delete your account and all associated data.
                </p>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                • <strong>Privacy Policy:</strong> Required consent cannot be withdrawn as it&apos;s necessary for service provision.
              </p>
              <p>
                • <strong>Marketing Communications:</strong> You can opt out anytime by unchecking the box above or clicking unsubscribe in our emails.
              </p>
              <p>
                • <strong>Analytics:</strong> Helps us improve our services. You can disable this without affecting core functionality.
              </p>
              <p>
                • <strong>Data Retention:</strong> We retain consent records for 3 years after withdrawal for compliance purposes.
              </p>
              <p>
                • <strong>Changes:</strong> We&apos;ll notify you of any material changes to our privacy practices.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
