import { DocumentationTemplate, ClientConfig } from '@/types/handover';

export class DocumentationTemplateManager {
  private templates: Map<string, DocumentationTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    // Quick Start Guide Template
    this.templates.set('quick-start', {
      id: 'quick-start',
      name: 'Quick Start Guide',
      description: 'Essential information for immediate productivity',
      sections: [
        'login-instructions',
        'dashboard-overview',
        'first-tasks',
        'immediate-help'
      ],
      format: 'markdown',
      estimatedLength: 'short',
      targetAudience: 'new-users',
      lastUpdated: new Date()
    });

    // Complete User Manual Template
    this.templates.set('complete-manual', {
      id: 'complete-manual',
      name: 'Complete User Manual',
      description: 'Comprehensive documentation covering all features',
      sections: [
        'introduction',
        'getting-started',
        'navigation',
        'features-overview',
        'detailed-features',
        'advanced-usage',
        'troubleshooting',
        'appendices'
      ],
      format: 'markdown',
      estimatedLength: 'long',
      targetAudience: 'all-users',
      lastUpdated: new Date()
    });

    // Administrator Guide Template
    this.templates.set('admin-guide', {
      id: 'admin-guide',
      name: 'Administrator Guide',
      description: 'Administrative functions and system management',
      sections: [
        'admin-overview',
        'user-management',
        'system-configuration',
        'security-settings',
        'monitoring-tools',
        'maintenance-procedures',
        'troubleshooting-advanced'
      ],
      format: 'markdown',
      estimatedLength: 'medium',
      targetAudience: 'administrators',
      lastUpdated: new Date()
    });

    // API Documentation Template
    this.templates.set('api-docs', {
      id: 'api-docs',
      name: 'API Documentation',
      description: 'Technical documentation for developers',
      sections: [
        'api-overview',
        'authentication',
        'endpoints',
        'request-response-formats',
        'error-handling',
        'rate-limiting',
        'examples'
      ],
      format: 'markdown',
      estimatedLength: 'long',
      targetAudience: 'developers',
      lastUpdated: new Date()
    });

    // Training Materials Template
    this.templates.set('training-materials', {
      id: 'training-materials',
      name: 'Training Materials',
      description: 'Structured learning materials for user education',
      sections: [
        'learning-objectives',
        'course-overview',
        'module-1-basics',
        'module-2-intermediate',
        'module-3-advanced',
        'exercises',
        'assessments',
        'resources'
      ],
      format: 'markdown',
      estimatedLength: 'long',
      targetAudience: 'trainees',
      lastUpdated: new Date()
    });

    // Release Notes Template
    this.templates.set('release-notes', {
      id: 'release-notes',
      name: 'Release Notes',
      description: 'Documentation of changes and new features',
      sections: [
        'release-summary',
        'new-features',
        'improvements',
        'bug-fixes',
        'breaking-changes',
        'migration-guide',
        'known-issues'
      ],
      format: 'markdown',
      estimatedLength: 'short',
      targetAudience: 'all-users',
      lastUpdated: new Date()
    });

    // Security Guide Template
    this.templates.set('security-guide', {
      id: 'security-guide',
      name: 'Security Guide',
      description: 'Security best practices and procedures',
      sections: [
        'security-overview',
        'authentication-security',
        'data-protection',
        'access-controls',
        'incident-response',
        'compliance',
        'security-checklist'
      ],
      format: 'markdown',
      estimatedLength: 'medium',
      targetAudience: 'security-focused',
      lastUpdated: new Date()
    });

    // Business Process Guide Template
    this.templates.set('business-process', {
      id: 'business-process',
      name: 'Business Process Guide',
      description: 'Workflow documentation and business procedures',
      sections: [
        'process-overview',
        'workflow-diagrams',
        'step-by-step-procedures',
        'roles-responsibilities',
        'quality-standards',
        'metrics-kpis',
        'continuous-improvement'
      ],
      format: 'markdown',
      estimatedLength: 'medium',
      targetAudience: 'business-users',
      lastUpdated: new Date()
    });
  }

  generateDocumentationFromTemplate(
    templateId: string,
    clientConfig: ClientConfig,
    customSections?: string[]
  ): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const sections = customSections || template.sections;
    let documentation = this.generateDocumentHeader(template, clientConfig);

    sections.forEach(sectionId => {
      documentation += this.generateSectionContent(sectionId, clientConfig, template);
      documentation += '\n\n---\n\n';
    });

    documentation += this.generateDocumentFooter(template, clientConfig);

    return documentation;
  }

  private generateDocumentHeader(template: DocumentationTemplate, clientConfig: ClientConfig): string {
    return `# ${template.name}

**Client:** ${clientConfig.businessName}
**Generated:** ${new Date().toLocaleDateString()}
**Template:** ${template.name}
**Audience:** ${template.targetAudience}

## Description
${template.description}

## Table of Contents

${template.sections.map((section, index) =>
  `${index + 1}. [${this.formatSectionTitle(section)}](#${section})`
).join('\n')}

---

`;
  }

  private generateSectionContent(
    sectionId: string,
    clientConfig: ClientConfig,
    template: DocumentationTemplate
  ): string {
    switch (sectionId) {
      case 'login-instructions':
        return this.generateLoginInstructions(clientConfig);
      case 'dashboard-overview':
        return this.generateDashboardOverview(clientConfig);
      case 'first-tasks':
        return this.generateFirstTasks(clientConfig);
      case 'immediate-help':
        return this.generateImmediateHelp(clientConfig);
      case 'introduction':
        return this.generateIntroduction(clientConfig);
      case 'getting-started':
        return this.generateGettingStarted(clientConfig);
      case 'navigation':
        return this.generateNavigation(clientConfig);
      case 'features-overview':
        return this.generateFeaturesOverview(clientConfig);
      case 'detailed-features':
        return this.generateDetailedFeatures(clientConfig);
      case 'advanced-usage':
        return this.generateAdvancedUsage(clientConfig);
      case 'troubleshooting':
        return this.generateTroubleshooting(clientConfig);
      case 'appendices':
        return this.generateAppendices(clientConfig);
      case 'admin-overview':
        return this.generateAdminOverview(clientConfig);
      case 'user-management':
        return this.generateUserManagement(clientConfig);
      case 'system-configuration':
        return this.generateSystemConfiguration(clientConfig);
      case 'security-settings':
        return this.generateSecuritySettings(clientConfig);
      case 'monitoring-tools':
        return this.generateMonitoringTools(clientConfig);
      case 'maintenance-procedures':
        return this.generateMaintenanceProcedures(clientConfig);
      case 'troubleshooting-advanced':
        return this.generateAdvancedTroubleshooting(clientConfig);
      case 'api-overview':
        return this.generateAPIOverview(clientConfig);
      case 'authentication':
        return this.generateAuthentication(clientConfig);
      case 'endpoints':
        return this.generateEndpoints(clientConfig);
      case 'request-response-formats':
        return this.generateRequestResponseFormats(clientConfig);
      case 'error-handling':
        return this.generateErrorHandling(clientConfig);
      case 'rate-limiting':
        return this.generateRateLimiting(clientConfig);
      case 'examples':
        return this.generateExamples(clientConfig);
      default:
        return this.generateGenericSection(sectionId, clientConfig);
    }
  }

  private generateLoginInstructions(clientConfig: ClientConfig): string {
    return `## Login Instructions

### Accessing Your Application

1. **Open your web browser** and navigate to:
   \`${clientConfig.domain || 'your-application-url.com'}\`

2. **Enter your credentials:**
   - **Username:** Your email address
   - **Password:** Provided by your administrator

3. **First-time login:**
   - You may be prompted to change your password
   - Complete any required profile information
   - Set up two-factor authentication if required

### Login Troubleshooting

**Forgot Password:**
- Click "Forgot Password" link on login page
- Enter your email address
- Check email for reset instructions

**Account Locked:**
- Contact your system administrator
- Wait for automatic unlock (if configured)
- Ensure you're using correct credentials

**Browser Issues:**
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Use a different browser if problems persist`;
  }

  private generateDashboardOverview(clientConfig: ClientConfig): string {
    return `## Dashboard Overview

### Main Dashboard Components

Your ${clientConfig.businessName} dashboard provides a centralized view of important information and quick access to key features.

#### Key Sections

**Quick Stats**
- Important metrics and KPIs
- Real-time data updates
- Visual indicators for status

**Recent Activity**
- Latest system activity
- Recent user actions
- Important notifications

**Quick Actions**
- One-click access to common tasks
- Shortcut buttons for frequent operations
- Create new items quickly

**Navigation Panel**
- Access to all application features
- Organized by function and frequency
- Search functionality

#### Customization Options

**Widget Management:**
1. Click "Customize Dashboard"
2. Add or remove widgets
3. Resize and rearrange components
4. Save your preferred layout

**Personalization:**
- Set default views for data
- Configure refresh intervals
- Choose color themes (if available)
- Set up personal shortcuts`;
  }

  private generateFirstTasks(clientConfig: ClientConfig): string {
    return `## First Tasks

### Essential Setup Steps

Complete these tasks to get started efficiently:

#### 1. Profile Setup (5 minutes)
- Update your personal information
- Set timezone to ${clientConfig.timezone || 'your local timezone'}
- Configure notification preferences
- Upload profile photo (optional)

#### 2. Explore Main Features (15 minutes)
${clientConfig.enabledFeatures?.map(feature =>
  `- **${this.formatFeatureName(feature)}:** ${this.getFeatureDescription(feature)}`
).join('\n') || '- Explore the main features available to your role'}

#### 3. Complete Sample Tasks (10 minutes)
Try these common actions to familiarize yourself:
- Create a test record (if applicable)
- Run a simple report
- Use the search functionality
- Practice navigation between sections

#### 4. Set Up Preferences (5 minutes)
- Configure dashboard widgets
- Set up saved searches (if needed)
- Bookmark frequently used pages
- Test notification settings

### Next Steps

After completing initial setup:
1. Review any pending assignments
2. Connect with team members (if applicable)
3. Explore advanced features relevant to your role
4. Schedule training if needed`;
  }

  private generateImmediateHelp(clientConfig: ClientConfig): string {
    return `## Immediate Help

### Quick Help Resources

#### Built-in Help
- **Help icons (?)** throughout the interface
- **Tooltips** on hover over elements
- **Contextual help** in each section
- **Validation messages** for form guidance

#### Contact Information

**Technical Support:**
- Email: support@${clientConfig.domain || 'your-company.com'}
- Response time: Within 4 hours during business hours

**System Administrator:**
- For account and permission issues
- Password resets and access problems

**Emergency Support:**
- For critical system issues only
- Available 24/7 for urgent problems

#### Self-Service Options

**Common Solutions:**
1. **Login problems:** Clear browser cache, try different browser
2. **Slow performance:** Close extra browser tabs, check internet connection
3. **Missing data:** Check filters and search terms
4. **Permission errors:** Contact administrator

**Documentation:**
- This quick start guide
- Detailed user manual (if available)
- Video tutorials (if available)
- FAQ section

### Getting Additional Training

**Training Options:**
- Self-paced online materials
- Scheduled group training sessions
- One-on-one training appointments
- Peer mentoring programs

**Training Request:**
- Contact: training@${clientConfig.domain || 'your-company.com'}
- Include: Your role, specific needs, preferred format
- Timeline: Allow 1 week for scheduling`;
  }

  private generateIntroduction(clientConfig: ClientConfig): string {
    return `## Introduction

### Welcome to ${clientConfig.businessName}

This comprehensive user manual will guide you through all aspects of your custom application. Whether you're a new user or looking to expand your knowledge, this manual provides detailed instructions and best practices.

### About Your Application

Your application has been specifically designed and configured for ${clientConfig.businessName} to:
- Streamline business processes
- Improve team collaboration
- Provide data insights and reporting
- Ensure security and compliance
- Support your unique workflows

### Application Features

Your system includes:
${clientConfig.enabledFeatures?.map(feature =>
  `- **${this.formatFeatureName(feature)}:** ${this.getFeatureDescription(feature)}`
).join('\n') || '- Custom features tailored to your business needs'}

### System Requirements

**Supported Browsers:**
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Network Requirements:**
- Stable internet connection
- Access to ${clientConfig.domain || 'application domain'}

### Getting the Most from This Manual

**How to Use This Guide:**
- Read sections in order for comprehensive understanding
- Use as reference for specific tasks
- Follow links to related topics
- Practice examples in a safe environment

**Conventions Used:**
- \`Code/URLs\` appear in monospace font
- **Bold text** indicates important concepts
- *Italic text* emphasizes key points
- → Arrows show navigation paths`;
  }

  private generateGettingStarted(clientConfig: ClientConfig): string {
    return `## Getting Started

### Initial Access

#### First Login Process
1. **Receive credentials** from your administrator
2. **Navigate to application URL:** ${clientConfig.domain || 'your-application-url.com'}
3. **Enter temporary credentials** provided
4. **Complete initial setup:**
   - Change temporary password
   - Update profile information
   - Set security preferences
   - Configure notifications

#### Profile Configuration
**Required Information:**
- Full name and contact details
- Department and role information
- Preferred timezone and language
- Notification preferences

**Optional Settings:**
- Profile photo
- Personal dashboard layout
- Default views and filters
- Accessibility preferences

### Application Orientation

#### Understanding the Interface
**Top Navigation:**
- Application logo (home link)
- Main feature navigation
- Search functionality
- User profile and settings
- Notifications panel

**Main Content Area:**
- Primary feature content
- Data tables and forms
- Charts and visualizations
- Action buttons and controls

**Footer:**
- Additional navigation links
- System status information
- Version information
- Support contact links

#### Navigation Patterns
**Primary Navigation:**
- Click main menu items to access features
- Use breadcrumbs to track location
- Search for specific items or content

**Secondary Navigation:**
- Sub-menus for feature categories
- Tabbed interfaces for related functions
- Filter and sort options for data

### Essential Skills

#### Basic Operations
**Creating Records:**
1. Navigate to appropriate section
2. Click "Create" or "Add New" button
3. Fill required fields (marked with *)
4. Save work frequently
5. Submit when complete

**Editing Information:**
1. Find record using search or browse
2. Click "Edit" or record title
3. Make necessary changes
4. Save modifications
5. Verify updates applied

**Searching and Filtering:**
1. Use global search for quick finds
2. Apply filters to narrow results
3. Sort columns by clicking headers
4. Save common searches for reuse

#### Data Management
**Import/Export:**
- Export data in Excel, CSV, or PDF formats
- Import data using provided templates
- Validate imported data before saving
- Handle import errors appropriately

**File Handling:**
- Upload files using drag-and-drop
- Organize files in logical folders
- Set appropriate sharing permissions
- Manage file versions and history`;
  }

  private formatSectionTitle(sectionId: string): string {
    return sectionId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private formatFeatureName(feature: string): string {
    return feature
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getFeatureDescription(feature: string): string {
    const descriptions: Record<string, string> = {
      'user-management': 'Manage user accounts and permissions',
      'dashboard': 'Overview with key metrics and quick actions',
      'reporting': 'Generate and analyze business reports',
      'notifications': 'Real-time alerts and messaging system',
      'file-management': 'Secure file storage and sharing',
      'calendar': 'Schedule management and coordination',
      'messaging': 'Team communication and collaboration',
      'analytics': 'Business intelligence and insights',
      'integration': 'External system connections',
      'mobile': 'Mobile device optimization'
    };

    return descriptions[feature] || 'Custom business functionality';
  }

  private generateGenericSection(sectionId: string, clientConfig: ClientConfig): string {
    return `## ${this.formatSectionTitle(sectionId)}

This section provides information about ${sectionId.replace('-', ' ')} for ${clientConfig.businessName}.

Content for this section would be customized based on your specific requirements and the selected template.

For detailed information about this topic, please contact your system administrator or refer to additional documentation resources.`;
  }

  private generateDocumentFooter(template: DocumentationTemplate, clientConfig: ClientConfig): string {
    return `
## Appendices

### Document Information
- **Template Used:** ${template.name}
- **Generated For:** ${clientConfig.businessName}
- **Creation Date:** ${new Date().toLocaleDateString()}
- **Application URL:** ${clientConfig.domain || 'Contact administrator for URL'}

### Support Information
- **Technical Support:** support@${clientConfig.domain || 'your-company.com'}
- **System Administrator:** Contact your IT department
- **Documentation Updates:** Automatically generated with system changes

### Feedback
We value your feedback on this documentation. Please contact us with:
- Suggestions for improvement
- Requests for additional content
- Reports of outdated information
- Questions about specific procedures

---

*This document was automatically generated for ${clientConfig.businessName} on ${new Date().toLocaleDateString()}.*
`;
  }

  // Placeholder methods for additional sections
  private generateNavigation(clientConfig: ClientConfig): string {
    return `## Navigation\n\nNavigation guide content for ${clientConfig.businessName}.`;
  }

  private generateFeaturesOverview(clientConfig: ClientConfig): string {
    return `## Features Overview\n\nFeatures overview content for ${clientConfig.businessName}.`;
  }

  private generateDetailedFeatures(clientConfig: ClientConfig): string {
    return `## Detailed Features\n\nDetailed features content for ${clientConfig.businessName}.`;
  }

  private generateAdvancedUsage(clientConfig: ClientConfig): string {
    return `## Advanced Usage\n\nAdvanced usage content for ${clientConfig.businessName}.`;
  }

  private generateTroubleshooting(clientConfig: ClientConfig): string {
    return `## Troubleshooting\n\nTroubleshooting guide content for ${clientConfig.businessName}.`;
  }

  private generateAppendices(clientConfig: ClientConfig): string {
    return `## Appendices\n\nAppendices content for ${clientConfig.businessName}.`;
  }

  private generateAdminOverview(clientConfig: ClientConfig): string {
    return `## Administrator Overview\n\nAdministrator overview content for ${clientConfig.businessName}.`;
  }

  private generateUserManagement(clientConfig: ClientConfig): string {
    return `## User Management\n\nUser management content for ${clientConfig.businessName}.`;
  }

  private generateSystemConfiguration(clientConfig: ClientConfig): string {
    return `## System Configuration\n\nSystem configuration content for ${clientConfig.businessName}.`;
  }

  private generateSecuritySettings(clientConfig: ClientConfig): string {
    return `## Security Settings\n\nSecurity settings content for ${clientConfig.businessName}.`;
  }

  private generateMonitoringTools(clientConfig: ClientConfig): string {
    return `## Monitoring Tools\n\nMonitoring tools content for ${clientConfig.businessName}.`;
  }

  private generateMaintenanceProcedures(clientConfig: ClientConfig): string {
    return `## Maintenance Procedures\n\nMaintenance procedures content for ${clientConfig.businessName}.`;
  }

  private generateAdvancedTroubleshooting(clientConfig: ClientConfig): string {
    return `## Advanced Troubleshooting\n\nAdvanced troubleshooting content for ${clientConfig.businessName}.`;
  }

  private generateAPIOverview(clientConfig: ClientConfig): string {
    return `## API Overview\n\nAPI overview content for ${clientConfig.businessName}.`;
  }

  private generateAuthentication(clientConfig: ClientConfig): string {
    return `## Authentication\n\nAuthentication documentation for ${clientConfig.businessName}.`;
  }

  private generateEndpoints(clientConfig: ClientConfig): string {
    return `## API Endpoints\n\nAPI endpoints documentation for ${clientConfig.businessName}.`;
  }

  private generateRequestResponseFormats(clientConfig: ClientConfig): string {
    return `## Request/Response Formats\n\nRequest and response format documentation for ${clientConfig.businessName}.`;
  }

  private generateErrorHandling(clientConfig: ClientConfig): string {
    return `## Error Handling\n\nError handling documentation for ${clientConfig.businessName}.`;
  }

  private generateRateLimiting(clientConfig: ClientConfig): string {
    return `## Rate Limiting\n\nRate limiting documentation for ${clientConfig.businessName}.`;
  }

  private generateExamples(clientConfig: ClientConfig): string {
    return `## Examples\n\nCode examples and usage patterns for ${clientConfig.businessName}.`;
  }

  getTemplate(templateId: string): DocumentationTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): DocumentationTemplate[] {
    return Array.from(this.templates.values());
  }

  addCustomTemplate(template: DocumentationTemplate): void {
    this.templates.set(template.id, template);
  }

  removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  updateTemplate(templateId: string, updates: Partial<DocumentationTemplate>): void {
    const existing = this.templates.get(templateId);
    if (existing) {
      this.templates.set(templateId, { ...existing, ...updates, lastUpdated: new Date() });
    }
  }
}

export const documentationTemplateManager = new DocumentationTemplateManager();