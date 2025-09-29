'use client';

/**
 * Industry Selection Interface
 *
 * Interactive component for selecting industries and previewing
 * industry-specific template configurations.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  industryConfigs,
  type IndustryConfig,
  INDUSTRY_CONFIGS,
  UNIVERSAL_CONFIG
} from '@/lib/templates/industry-configs';
import {
  CheckCircle,
  Search,
  Settings,
  Users,
  TrendingUp,
  Shield,
  ChevronRight,
  Star,
  AlertCircle,
  Info
} from 'lucide-react';

interface IndustrySelectorProps {
  selectedIndustry?: string;
  onIndustrySelect: (industryId: string, config: IndustryConfig) => void;
  showDetails?: boolean;
  allowCustomization?: boolean;
  className?: string;
}

export function IndustrySelector({
  selectedIndustry,
  onIndustrySelect,
  showDetails = true,
  allowCustomization = false,
  className = ''
}: IndustrySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<IndustryConfig | null>(null);
  const [previewMode, setPreviewMode] = useState<'overview' | 'questionnaire' | 'services' | 'content'>('overview');

  const allConfigs = [UNIVERSAL_CONFIG, ...Object.values(INDUSTRY_CONFIGS)];

  const filteredConfigs = allConfigs.filter(config =>
    config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.keywords.some(keyword =>
      keyword.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  useEffect(() => {
    if (selectedIndustry) {
      const config = industryConfigs.get(selectedIndustry);
      setSelectedConfig(config);
    }
  }, [selectedIndustry]);

  const handleIndustrySelect = (config: IndustryConfig) => {
    setSelectedConfig(config);
    onIndustrySelect(config.id, config);
  };

  const getIndustryIcon = (industryId: string) => {
    switch (industryId) {
      case 'tech-saas':
        return '💻';
      case 'healthcare':
        return '🏥';
      case 'professional-services':
        return '⚖️';
      case 'universal':
        return '🏢';
      default:
        return '🏢';
    }
  };

  const getComplexityColor = (config: IndustryConfig) => {
    const questionsCount = config.questionnaire_modifications.additional_questions.length;
    const servicesCount = config.default_service_packages.length;
    const complexity = questionsCount + servicesCount;

    if (complexity >= 4) return 'bg-red-100 text-red-800';
    if (complexity >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getComplexityLabel = (config: IndustryConfig) => {
    const questionsCount = config.questionnaire_modifications.additional_questions.length;
    const servicesCount = config.default_service_packages.length;
    const complexity = questionsCount + servicesCount;

    if (complexity >= 4) return 'Advanced';
    if (complexity >= 2) return 'Standard';
    return 'Basic';
  };

  return (
    <div className={`industry-selector ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Select Your Industry
          </h2>
          <p className="text-gray-600 mt-2">
            Choose your industry to get a customized consultation template with relevant questions and services.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search industries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Industry Selection */}
          <div className="lg:col-span-1">
            <div className="space-y-3">
              {filteredConfigs.map((config) => (
                <Card
                  key={config.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedConfig?.id === config.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleIndustrySelect(config)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {getIndustryIcon(config.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {config.name}
                          </h3>
                          {selectedConfig?.id === config.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {config.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge
                            variant="secondary"
                            className={getComplexityColor(config)}
                          >
                            {getComplexityLabel(config)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {config.target_segments.length} segments
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Industry Details */}
          <div className="lg:col-span-2">
            {selectedConfig ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {getIndustryIcon(selectedConfig.id)}
                        </span>
                        <span>{selectedConfig.name}</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {selectedConfig.description}
                      </CardDescription>
                    </div>
                    {allowCustomization && (
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {showDetails && (
                  <CardContent>
                    <Tabs value={previewMode} onValueChange={(value: any) => setPreviewMode(value)}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="questionnaire">Questions</TabsTrigger>
                        <TabsTrigger value="services">Services</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Target Segments</h4>
                            <div className="space-y-1">
                              {selectedConfig.target_segments.map((segment, index) => (
                                <Badge key={index} variant="outline">
                                  {segment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedConfig.keywords.slice(0, 6).map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            <AlertCircle className="h-4 w-4 inline mr-2" />
                            Typical Challenges
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {selectedConfig.typical_challenges.slice(0, 4).map((challenge, index) => (
                              <li key={index} className="flex items-center">
                                <ChevronRight className="h-3 w-3 mr-2" />
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            <TrendingUp className="h-4 w-4 inline mr-2" />
                            Success Metrics
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {selectedConfig.success_metrics.slice(0, 4).map((metric, index) => (
                              <li key={index} className="flex items-center">
                                <Star className="h-3 w-3 mr-2 text-yellow-500" />
                                {metric}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {selectedConfig.regulatory_considerations.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              <Shield className="h-4 w-4 inline mr-2" />
                              Compliance Requirements
                            </h4>
                            <div className="space-y-1">
                              {selectedConfig.regulatory_considerations.slice(0, 3).map((req, index) => (
                                <Badge key={index} variant="outline" className="mr-2">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="questionnaire" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            Industry-Specific Questions
                          </h4>
                          <Badge variant="secondary">
                            +{selectedConfig.questionnaire_modifications.additional_questions.length} questions
                          </Badge>
                        </div>

                        {selectedConfig.questionnaire_modifications.additional_questions.length > 0 ? (
                          <div className="space-y-3">
                            {selectedConfig.questionnaire_modifications.additional_questions.slice(0, 3).map((question, index) => (
                              <Card key={index} className="p-3">
                                <div className="space-y-2">
                                  <p className="font-medium text-sm">{question.text}</p>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {question.type}
                                    </Badge>
                                    {question.required && (
                                      <Badge variant="destructive" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  {question.options && (
                                    <div className="text-xs text-gray-600">
                                      {question.options.length} options available
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                            {selectedConfig.questionnaire_modifications.additional_questions.length > 3 && (
                              <p className="text-sm text-gray-500 text-center">
                                +{selectedConfig.questionnaire_modifications.additional_questions.length - 3} more questions
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Info className="h-8 w-8 mx-auto mb-2" />
                            <p>This industry uses the standard questionnaire without additional questions.</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="services" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            Default Service Packages
                          </h4>
                          <Badge variant="secondary">
                            {selectedConfig.default_service_packages.length} packages
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          {selectedConfig.default_service_packages.map((service, index) => (
                            <Card key={index} className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium">{service.title}</h5>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline">{service.tier}</Badge>
                                    <Badge variant="secondary">{service.price_band}</Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">{service.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>⏱️ {service.timeline}</span>
                                  <span>📋 {service.includes.length} deliverables</span>
                                  <span>🏷️ {service.industry_tags.length} tags</span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="content" className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Content Templates</h4>

                          <div className="space-y-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Hero Titles</h5>
                              <div className="space-y-2">
                                {selectedConfig.content_templates.hero_titles.slice(0, 2).map((title, index) => (
                                  <Card key={index} className="p-3">
                                    <p className="text-sm">{title}</p>
                                  </Card>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Value Propositions</h5>
                              <div className="grid grid-cols-1 gap-2">
                                {selectedConfig.content_templates.value_propositions.slice(0, 4).map((prop, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">{prop}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {selectedConfig.content_templates.case_studies.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Case Study Example</h5>
                                <Card className="p-3">
                                  <div className="space-y-2">
                                    <h6 className="font-medium text-sm">
                                      {selectedConfig.content_templates.case_studies[0].title}
                                    </h6>
                                    <p className="text-xs text-gray-600">
                                      <strong>Challenge:</strong> {selectedConfig.content_templates.case_studies[0].challenge}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      <strong>Results:</strong> {selectedConfig.content_templates.case_studies[0].results}
                                    </p>
                                  </div>
                                </Card>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                )}
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select an Industry
                  </h3>
                  <p className="text-gray-600">
                    Choose an industry from the list to preview its customized template configuration.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {selectedConfig && (
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-gray-600">
              Template configured for <strong>{selectedConfig.name}</strong>
            </div>
            <div className="space-x-3">
              <Button variant="outline">
                Preview Template
              </Button>
              <Button onClick={() => onIndustrySelect(selectedConfig.id, selectedConfig)}>
                Use This Configuration
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Simplified Industry Selector (for embedded use)
 */
export function SimpleIndustrySelector({
  selectedIndustry,
  onIndustrySelect,
  className = ''
}: Pick<IndustrySelectorProps, 'selectedIndustry' | 'onIndustrySelect' | 'className'>) {
  const allConfigs = [UNIVERSAL_CONFIG, ...Object.values(INDUSTRY_CONFIGS)];

  return (
    <div className={`simple-industry-selector ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {allConfigs.map((config) => (
          <Card
            key={config.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedIndustry === config.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onIndustrySelect(config.id, config)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">
                {getIndustryIcon(config.id)}
              </div>
              <h3 className="font-medium text-sm text-gray-900 mb-1">
                {config.name}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2">
                {config.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Helper function for icon mapping (used by both components)
function getIndustryIcon(industryId: string): string {
  switch (industryId) {
    case 'tech-saas':
      return '💻';
    case 'healthcare':
      return '🏥';
    case 'professional-services':
      return '⚖️';
    case 'universal':
      return '🏢';
    default:
      return '🏢';
  }
}