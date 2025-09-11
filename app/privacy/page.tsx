/**
 * Privacy Policy Page
 * Task 18: Privacy/consent + audit log
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Eye, Calendar, MapPin, Phone, Mail as MailIcon } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline">Version 1.0</Badge>
            <Badge variant="outline">Last updated: January 27, 2025</Badge>
          </div>
        </div>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailIcon className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">privacy@yourorganization.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">123 Main St, City, State 12345</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Monday - Friday, 9 AM - 5 PM EST</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Information We Collect
            </CardTitle>
            <CardDescription>
              We collect information you provide directly to us and information collected automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Information You Provide</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Name, email address, and phone number</li>
                <li>• Profile information and preferences</li>
                <li>• Communication preferences and consent choices</li>
                <li>• Feedback and support requests</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Automatically Collected Information</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• IP address and device information</li>
                <li>• Browser type and version</li>
                <li>• Usage data and analytics</li>
                <li>• Cookies and similar technologies</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
            <CardDescription>
              We use your information to provide and improve our services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Service Delivery:</strong> Provide coaching services and manage your account</li>
              <li>• <strong>Communication:</strong> Send important updates and respond to your requests</li>
              <li>• <strong>Improvement:</strong> Analyze usage patterns to improve our services</li>
              <li>• <strong>Security:</strong> Protect against fraud and ensure account security</li>
              <li>• <strong>Compliance:</strong> Meet legal obligations and enforce our terms</li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
            <CardDescription>
              We do not sell your personal information. We may share information in limited circumstances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Service Providers:</strong> Trusted partners who help us operate our services</li>
              <li>• <strong>Legal Requirements:</strong> When required by law or to protect rights</li>
              <li>• <strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
              <li>• <strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
            <CardDescription>
              You have certain rights regarding your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Access & Control</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View your personal information</li>
                  <li>• Update or correct your data</li>
                  <li>• Delete your account</li>
                  <li>• Export your data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Consent Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Withdraw consent at any time</li>
                  <li>• Opt out of marketing communications</li>
                  <li>• Control cookie preferences</li>
                  <li>• Manage notification settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
            <CardDescription>
              We implement appropriate security measures to protect your information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
              <li>• <strong>Access Controls:</strong> Strict access controls and authentication</li>
              <li>• <strong>Regular Audits:</strong> Security assessments and monitoring</li>
              <li>• <strong>Incident Response:</strong> Procedures for security incidents</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
            <CardDescription>
              We retain your information for as long as necessary to provide our services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Account Data:</strong> Retained while your account is active</li>
              <li>• <strong>Audit Logs:</strong> Retained for 7 years for compliance</li>
              <li>• <strong>Consent Records:</strong> Retained for 3 years after withdrawal</li>
              <li>• <strong>Deletion:</strong> Data is securely deleted when no longer needed</li>
            </ul>
          </CardContent>
        </Card>

        {/* Changes to This Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
            <CardDescription>
              We may update this policy from time to time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              We will notify you of any material changes to this policy by email or through our services. 
              Your continued use of our services after changes become effective constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
