'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Terminal, 
  Play, 
  Copy, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Lightbulb,
  Settings,
  Shield,
  Zap,
  Code2,
  Wand2
} from 'lucide-react';

import { enhancedCLICommands, CLICommand, CommandOption, ProjectConfig } from '@/lib/cli/enhanced-commands';
import { intelligentDefaultsEngine, IntelligentDefaults, Recommendation } from '@/lib/cli/intelligent-defaults';

interface CommandBuilderProps {
  onCommandGenerated?: (command: string) => void;
  onExecute?: (command: string, config: ProjectConfig) => void;
}

export default function CommandBuilder({ onCommandGenerated, onExecute }: CommandBuilderProps) {
  const [selectedCommand, setSelectedCommand] = useState<string>('init');
  const [commandArgs, setCommandArgs] = useState<Record<string, any>>({});
  const [intelligentDefaults, setIntelligentDefaults] = useState<IntelligentDefaults | null>(null);
  const [generatedCommand, setGeneratedCommand] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const commands = enhancedCLICommands.getCommands();
  const currentCommand = enhancedCLICommands.getCommand(selectedCommand);

  useEffect(() => {
    if (currentCommand) {
      // Initialize with default values
      const defaults: Record<string, any> = {};
      currentCommand.options.forEach(option => {
        if (option.default !== undefined) {
          defaults[option.name] = option.default;
        }
      });
      setCommandArgs(defaults);
    }
  }, [selectedCommand, currentCommand]);

  useEffect(() => {
    generateIntelligentDefaults();
  }, [commandArgs.name, commandArgs.preset, commandArgs.tier]);

  useEffect(() => {
    generateCommand();
  }, [selectedCommand, commandArgs]);

  const generateIntelligentDefaults = () => {
    if (commandArgs.name && commandArgs.preset && commandArgs.tier) {
      const defaults = intelligentDefaultsEngine.generateIntelligentDefaults(
        commandArgs.name,
        commandArgs.preset,
        commandArgs.tier
      );
      setIntelligentDefaults(defaults);
    }
  };

  const generateCommand = () => {
    if (!currentCommand) return;

    let command = `npx dct ${selectedCommand}`;
    const args: string[] = [];

    Object.entries(commandArgs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'boolean') {
          if (value) {
            args.push(`--${key}`);
          }
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            args.push(`--${key} ${value.join(',')}`);
          }
        } else {
          args.push(`--${key} "${value}"`);
        }
      }
    });

    const fullCommand = command + (args.length > 0 ? ' ' + args.join(' ') : '');
    setGeneratedCommand(fullCommand);
    onCommandGenerated?.(fullCommand);
  };

  const validateCommand = (): boolean => {
    if (!currentCommand) return false;

    const validation = enhancedCLICommands.validateCommand(selectedCommand, commandArgs);
    setValidationErrors(validation.errors);
    return validation.valid;
  };

  const executeCommand = () => {
    if (!validateCommand()) return;

    const config: ProjectConfig = {
      clientName: commandArgs.name || '',
      preset: commandArgs.preset || 'salon-waitlist',
      tier: commandArgs.tier || 'starter',
      features: commandArgs.features || [],
      security: commandArgs.security || [],
      performance: commandArgs.performance || []
    };

    onExecute?.(generatedCommand, config);
  };

  const applyRecommendation = (recommendation: Recommendation) => {
    const newArgs = { ...commandArgs };

    switch (recommendation.type) {
      case 'feature':
        if (recommendation.id === 'upgrade-to-pro') {
          newArgs.tier = 'pro';
        }
        break;
      case 'security':
        if (recommendation.id === 'enhanced-security') {
          newArgs.security = [...(newArgs.security || []), 'rls', 'csp'];
        }
        break;
      case 'performance':
        if (recommendation.id === 'performance-monitoring') {
          newArgs.performance = [...(newArgs.performance || []), 'monitoring'];
        }
        break;
    }

    setCommandArgs(newArgs);
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(generatedCommand);
  };

  const exportCommand = () => {
    const blob = new Blob([generatedCommand], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dct-command.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentCommand) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a command to start building</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Command Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Command Builder
          </CardTitle>
          <CardDescription>
            Build and customize CLI commands with intelligent suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="command-select">Select Command</Label>
            <Select value={selectedCommand} onValueChange={setSelectedCommand}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a command" />
              </SelectTrigger>
              <SelectContent>
                {commands.map((cmd) => (
                  <SelectItem key={cmd.name} value={cmd.name}>
                    <div className="flex items-center gap-2">
                      <span>{cmd.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {cmd.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentCommand.description && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{currentCommand.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Command Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentCommand.options.map((option) => (
                <div key={option.name}>
                  <Label htmlFor={option.name}>
                    {option.name}
                    {option.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderOptionInput(option)}
                  {option.description && (
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advanced Options */}
          {showAdvanced && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Advanced Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Feature Flags</Label>
                    <div className="space-y-2 mt-2">
                      {['payments', 'webhooks', 'ai-features', 'guardian', 'rls', 'csp'].map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={feature}
                            checked={commandArgs.features?.includes(feature) || false}
                            onCheckedChange={(checked) => {
                              const features = commandArgs.features || [];
                              if (checked) {
                                setCommandArgs({
                                  ...commandArgs,
                                  features: [...features, feature]
                                });
                              } else {
                                setCommandArgs({
                                  ...commandArgs,
                                  features: features.filter((f: string) => f !== feature)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={feature} className="text-sm">
                            {feature.replace('-', ' ').toUpperCase()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Performance Options</Label>
                    <div className="space-y-2 mt-2">
                      {['caching', 'cdn', 'monitoring', 'optimization'].map((perf) => (
                        <div key={perf} className="flex items-center space-x-2">
                          <Checkbox
                            id={perf}
                            checked={commandArgs.performance?.includes(perf) || false}
                            onCheckedChange={(checked) => {
                              const performance = commandArgs.performance || [];
                              if (checked) {
                                setCommandArgs({
                                  ...commandArgs,
                                  performance: [...performance, perf]
                                });
                              } else {
                                setCommandArgs({
                                  ...commandArgs,
                                  performance: performance.filter((p: string) => p !== perf)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={perf} className="text-sm">
                            {perf.replace('-', ' ').toUpperCase()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
            <Button variant="outline" onClick={() => setCommandArgs({})}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Generated Command */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Generated Command
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-sm break-all">{generatedCommand}</code>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={copyCommand} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={exportCommand} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <Button 
                className="w-full" 
                onClick={executeCommand}
                disabled={validationErrors.length > 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Execute Command
              </Button>

              {validationErrors.length > 0 && (
                <div className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Intelligent Recommendations */}
          {intelligentDefaults && intelligentDefaults.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {intelligentDefaults.recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{recommendation.title}</h4>
                      <Badge 
                        variant={recommendation.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {recommendation.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {recommendation.description}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyRecommendation(recommendation)}
                      className="w-full"
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Command Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentCommand.examples.map((example, index) => (
                <div key={index} className="p-2 bg-muted rounded text-xs font-mono">
                  {example}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  function renderOptionInput(option: CommandOption): React.ReactNode {
    const value = commandArgs[option.name];

    switch (option.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2 mt-1">
            <Checkbox
              id={option.name}
              checked={value || false}
              onCheckedChange={(checked) =>
                setCommandArgs({ ...commandArgs, [option.name]: checked })
              }
            />
            <Label htmlFor={option.name} className="text-sm">
              Enable {option.name}
            </Label>
          </div>
        );

      case 'array':
        if (option.name === 'features') {
          return (
            <Select
              value={Array.isArray(value) ? value.join(',') : ''}
              onValueChange={(val) =>
                setCommandArgs({ ...commandArgs, [option.name]: val ? val.split(',') : [] })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select features" />
              </SelectTrigger>
              <SelectContent>
                {['payments', 'webhooks', 'ai-features', 'guardian', 'rls', 'csp'].map((feature) => (
                  <SelectItem key={feature} value={feature}>
                    {feature.replace('-', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return (
          <Input
            id={option.name}
            value={Array.isArray(value) ? value.join(',') : ''}
            onChange={(e) =>
              setCommandArgs({ 
                ...commandArgs, 
                [option.name]: e.target.value ? e.target.value.split(',') : [] 
              })
            }
            className="mt-1"
            placeholder={`Enter ${option.name} (comma-separated)`}
          />
        );

      case 'string':
        if (option.name === 'tier') {
          return (
            <Select
              value={value || ''}
              onValueChange={(val) => setCommandArgs({ ...commandArgs, [option.name]: val })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          );
        }
        if (option.name === 'preset') {
          return (
            <Select
              value={value || ''}
              onValueChange={(val) => setCommandArgs({ ...commandArgs, [option.name]: val })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salon-waitlist">Salon Waitlist</SelectItem>
                <SelectItem value="realtor-listing-hub">Realtor Listing Hub</SelectItem>
                <SelectItem value="consultation-engine">Consultation Engine</SelectItem>
              </SelectContent>
            </Select>
          );
        }
        return (
          <Input
            id={option.name}
            value={value || ''}
            onChange={(e) => setCommandArgs({ ...commandArgs, [option.name]: e.target.value })}
            className="mt-1"
            placeholder={`Enter ${option.name}`}
          />
        );

      default:
        return (
          <Input
            id={option.name}
            value={value || ''}
            onChange={(e) => setCommandArgs({ ...commandArgs, [option.name]: e.target.value })}
            className="mt-1"
            placeholder={`Enter ${option.name}`}
          />
        );
    }
  }
}
