'use client'

/**
 * Consultation Report Template Component
 *
 * Professional report template for consultation results with dynamic content,
 * customizable theming, and PDF-optimized layout.
 */

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Star,
  Calendar,
  User,
  Building,
  Mail,
  MapPin
} from 'lucide-react'
import type { ConsultationReport } from '@/lib/consultation/report-generator'

export interface ReportTemplateProps {
  report: ConsultationReport;
  variant?: 'full' | 'summary' | 'executive';
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * Professional consultation report template
 */
export function ReportTemplate({
  report,
  variant = 'full',
  showHeader = true,
  showFooter = true,
  className = ''
}: ReportTemplateProps) {
  const theme = report.customization.theme;

  const themeStyles = {
    '--primary-color': theme.primary_color,
    '--secondary-color': theme.secondary_color,
    '--accent-color': theme.accent_color,
    '--font-family': theme.font_family
  } as React.CSSProperties;

  const headerInfo = [
    { icon: Calendar, label: 'Generated', value: new Date(report.client_info.generated_date).toLocaleDateString() },
    { icon: Clock, label: 'Read Time', value: `${report.metadata.estimated_read_time} min` },
    { icon: Star, label: 'Match Score', value: `${Math.round(report.metadata.consultation_score * 100)}%` }
  ];

  return (
    <div
      id="consultation-report-content"
      className={`bg-white text-gray-900 ${className}`}
      style={themeStyles}
    >
      {/* Report Header */}
      {showHeader && (
        <header className="px-6 sm:px-8 py-8 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/20 border-b border-gray-200 print-keep-together">
          <div className="max-w-4xl mx-auto">
            {/* Brand and Logo */}
            {report.customization.include_branding && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {theme.logo_url && (
                    <img
                      src={theme.logo_url}
                      alt={theme.brand_name || 'Company Logo'}
                      className="h-8 w-auto"
                    />
                  )}
                  <span
                    className="text-lg font-semibold"
                    style={{ color: theme.primary_color }}
                  >
                    {theme.brand_name || 'Business Consultation'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {report.metadata.template_version}
                </div>
              </div>
            )}

            {/* Title Section */}
            <div className="text-center space-y-4">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-sm mb-4"
                style={{ backgroundColor: `${theme.primary_color}20` }}
              >
                <Target
                  className="w-8 h-8"
                  style={{ color: theme.primary_color }}
                />
              </div>

              <div className="space-y-2">
                <h1
                  className="text-3xl lg:text-4xl font-bold tracking-tight"
                  style={{ color: theme.primary_color }}
                >
                  {report.title}
                </h1>
                {report.subtitle && (
                  <p className="text-lg text-gray-600">
                    {report.subtitle}
                  </p>
                )}
              </div>

              {/* Client Information */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mt-6">
                {report.client_info.name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{report.client_info.name}</span>
                  </div>
                )}
                {report.client_info.company && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>{report.client_info.company}</span>
                  </div>
                )}
                {report.client_info.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{report.client_info.email}</span>
                  </div>
                )}
              </div>

              {/* Report Metadata */}
              <div className="flex flex-wrap justify-center gap-8 mt-6 pt-6 border-t border-gray-200">
                {headerInfo.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <item.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">{item.label}:</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8 space-y-8">
        {/* Executive Summary */}
        <section className="print-keep-together">
          <SectionHeader
            title="Executive Summary"
            icon={TrendingUp}
            color={theme.primary_color}
          />
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              {report.executive_summary}
            </p>
          </div>
        </section>

        <Separator />

        {/* Report Sections */}
        {report.sections
          .filter(section => variant === 'full' || section.required)
          .sort((a, b) => a.order - b.order)
          .map(section => (
            <section key={section.id} className="print-keep-together">
              <SectionHeader
                title={section.title}
                icon={CheckCircle}
                color={theme.secondary_color}
              />
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-700 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(section.content) }}
                />
              </div>
            </section>
          ))}

        <Separator />

        {/* Service Recommendations */}
        <section className="print-keep-together">
          <SectionHeader
            title="Service Recommendations"
            icon={Star}
            color={theme.primary_color}
          />

          {/* Primary Recommendation */}
          <Card className="mb-6 border-2" style={{ borderColor: `${theme.primary_color}40` }}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      className="text-white"
                      style={{ backgroundColor: theme.primary_color }}
                    >
                      Primary Recommendation
                    </Badge>
                    <Badge variant="outline">
                      {report.recommendations.primary.tier.charAt(0).toUpperCase() +
                       report.recommendations.primary.tier.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    {report.recommendations.primary.title}
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    {report.recommendations.primary.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {/* Service Details */}
                {report.customization.show_pricing && report.recommendations.primary.price_band && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">Investment:</span>
                    <Badge variant="outline">{report.recommendations.primary.price_band}</Badge>
                    {report.customization.show_timeline && report.recommendations.primary.timeline && (
                      <>
                        <span className="font-medium">Timeline:</span>
                        <Badge variant="outline">{report.recommendations.primary.timeline}</Badge>
                      </>
                    )}
                  </div>
                )}

                {/* What's Included */}
                {report.recommendations.primary.includes.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">What's Included</h4>
                    <div className="grid gap-2">
                      {report.recommendations.primary.includes.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {report.recommendations.reasoning.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Why This Recommendation</h4>
                    <div className="space-y-2">
                      {report.recommendations.reasoning.map((reason, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2.5 shrink-0" />
                          <span className="text-sm text-gray-700">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alternative Options */}
          {variant === 'full' && report.recommendations.alternatives.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Alternative Options</h3>
              <div className="grid gap-4">
                {report.recommendations.alternatives.slice(0, 2).map((service, index) => (
                  <Card key={service.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium">{service.title}</h4>
                        <Badge variant="secondary">{service.tier}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      {report.customization.show_pricing && service.price_band && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Investment: {service.price_band}</span>
                          {service.timeline && (
                            <>
                              <span>•</span>
                              <span>Timeline: {service.timeline}</span>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Implementation Roadmap */}
        {variant === 'full' && report.customization.show_implementation_steps && (
          <>
            <Separator />
            <section className="print-keep-together">
              <SectionHeader
                title="Implementation Roadmap"
                icon={Clock}
                color={theme.accent_color}
              />

              <div className="grid gap-6">
                {['phase_1', 'phase_2', 'phase_3'].map((phase, index) => {
                  const phaseData = report.implementation_roadmap[phase as keyof typeof report.implementation_roadmap];
                  if (!Array.isArray(phaseData)) return null;

                  return (
                    <Card key={phase}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: theme.accent_color }}
                          >
                            {index + 1}
                          </div>
                          Phase {index + 1} ({['0-30 days', '1-3 months', '3-6 months'][index]})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {phaseData.map((item: string, itemIndex: number) => (
                            <div key={itemIndex} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 shrink-0" />
                              <span className="text-sm text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Overall Timeline</h4>
                <p className="text-sm text-gray-700">{report.implementation_roadmap.timeline}</p>
              </div>
            </section>
          </>
        )}

        {/* Next Steps */}
        <Separator />
        <section className="print-keep-together">
          <SectionHeader
            title="Next Steps"
            icon={Target}
            color={theme.primary_color}
          />
          <div className="grid gap-3">
            {report.next_steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: theme.primary_color }}
                >
                  {index + 1}
                </div>
                <span className="text-gray-700">{step}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Appendices (Executive variant doesn't include) */}
        {variant === 'full' && report.appendices && (
          <>
            <Separator />
            <section className="print-keep-together">
              <SectionHeader
                title="Additional Information"
                icon={CheckCircle}
                color={theme.secondary_color}
              />

              <div className="space-y-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Methodology</h4>
                  <p className="text-gray-600">{report.appendices.methodology}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Assumptions</h4>
                  <p className="text-gray-600">{report.appendices.assumptions}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Important Disclaimers</h4>
                  <p className="text-gray-600">{report.appendices.disclaimers}</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Report Footer */}
      {showFooter && (
        <footer className="mt-12 px-6 sm:px-8 py-6 bg-gray-50 border-t border-gray-200 print-hidden">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div>
              Generated by {report.metadata.generated_by}
            </div>

            {report.customization.custom_footer && (
              <div>{report.customization.custom_footer}</div>
            )}

            <div>
              {new Date(report.client_info.generated_date).toLocaleDateString()} •
              Page 1 of 1
            </div>
          </div>
        </footer>
      )}

      {/* Watermark */}
      {report.customization.watermark && (
        <div
          className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-5 text-6xl font-bold"
          style={{
            color: theme.primary_color,
            transform: 'rotate(-45deg)',
            zIndex: -1
          }}
        >
          {report.customization.watermark}
        </div>
      )}
    </div>
  );
}

/**
 * Section header component
 */
function SectionHeader({
  title,
  icon: Icon,
  color
}: {
  title: string;
  icon: React.ComponentType<any>;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon
          className="w-5 h-5"
          style={{ color }}
        />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    </div>
  );
}

/**
 * Simple markdown formatting for report content
 */
function formatMarkdown(content: string): string {
  return content
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Bullet points
    .replace(/^• (.*$)/gim, '<li>$1</li>')
    // Line breaks
    .replace(/\n/g, '<br />');
}