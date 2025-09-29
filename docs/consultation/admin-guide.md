# Consultation Micro-App Admin Guide
## HT-030.4.4: Documentation & Client Handover Package

### Overview

This administrative guide provides comprehensive instructions for managing and configuring the Consultation Micro-App. It covers all administrative features, configuration options, monitoring capabilities, and maintenance procedures.

---

## Table of Contents

1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [Client Management](#client-management)
3. [Service Package Management](#service-package-management)
4. [Template Customization](#template-customization)
5. [Branding & White-labeling](#branding--white-labeling)
6. [Content Management](#content-management)
7. [Analytics & Reporting](#analytics--reporting)
8. [Performance Monitoring](#performance-monitoring)
9. [System Configuration](#system-configuration)
10. [User Management](#user-management)
11. [Troubleshooting](#troubleshooting)
12. [Maintenance](#maintenance)

---

## Admin Dashboard Overview

### Accessing the Admin Dashboard

**URL**: `/admin/consultation`
**Authentication**: Admin credentials required
**Browser Requirements**: Modern browser with JavaScript enabled

### Dashboard Layout

The admin dashboard provides a comprehensive overview of consultation system performance:

#### Key Metrics Cards
- **Total Consultations**: Overall consultation count with trend indicators
- **Active Sessions**: Current users completing questionnaires
- **Completion Rate**: Percentage of started consultations that complete
- **Average Response Time**: AI generation performance metrics

#### Quick Actions Panel
- **Create New Client Configuration**
- **Update Service Packages**
- **Review Recent Consultations**
- **Export Analytics Data**
- **System Health Check**

#### Recent Activity Feed
- New consultation completions
- Client configuration changes
- System alerts and notifications
- Performance anomalies

---

## Client Management

### Client Configuration Overview

Navigate to **Admin → Clients** to manage client configurations and isolation settings.

### Adding New Clients

1. **Basic Information**
   ```
   Client Name: [Business name]
   Client ID: [Auto-generated unique identifier]
   Admin Email: [Primary contact email]
   Domain: [Custom domain if applicable]
   ```

2. **Configuration Settings**
   ```
   Environment: [staging/production]
   Template ID: [consultation-template-v1]
   Max File Size: [10MB default]
   Session Timeout: [30 minutes default]
   ```

3. **Feature Flags**
   - AI-powered recommendations (enabled/disabled)
   - PDF report generation (enabled/disabled)
   - Email automation (enabled/disabled)
   - Performance monitoring (enabled/disabled)
   - Custom branding (enabled/disabled)

### Client Isolation & Security

#### Data Separation
- Each client has isolated database schema
- Separate file storage buckets
- Individual cache namespaces
- Isolated session management

#### Access Control
- Role-based permissions (admin/viewer/editor)
- IP whitelisting options
- API rate limiting per client
- Audit logging for all actions

### Client Status Management

#### Status Types
- **Active**: Fully operational
- **Suspended**: Temporarily disabled
- **Maintenance**: Under configuration
- **Archive**: Historical data only

#### Status Change Procedures
1. Navigate to **Clients → [Client Name] → Settings**
2. Select new status from dropdown
3. Provide reason for change
4. Confirm action with admin password
5. System automatically notifies stakeholders

---

## Service Package Management

### Package Configuration

Access via **Admin → Service Packages** to manage consultation offerings.

### Creating Service Packages

#### Package Structure
```json
{
  "package_id": "enterprise-growth-v1",
  "name": "Enterprise Growth Package",
  "description": "Comprehensive solution for scaling businesses",
  "price": "$25,000",
  "duration": "3-4 months",
  "features": [
    "Custom Development",
    "Team Training",
    "24/7 Support",
    "Performance Monitoring"
  ],
  "target_criteria": {
    "business_type": ["SaaS", "Enterprise"],
    "team_size": ["50-100", "100+"],
    "budget": ["$25k-50k", "$50k+"]
  }
}
```

#### Package Categories
- **Starter Packages**: Small businesses and startups
- **Growth Packages**: Scaling businesses
- **Enterprise Packages**: Large organizations
- **Custom Packages**: Tailored solutions

### Package Matching Logic

#### Criteria-Based Matching
The system automatically matches user responses to appropriate packages:

1. **Business Type Matching**: Industry-specific packages
2. **Size-Based Filtering**: Team size and revenue considerations
3. **Budget Alignment**: Price range compatibility
4. **Timeline Matching**: Project duration requirements
5. **Feature Prioritization**: Specific capability needs

#### Scoring Algorithm
```javascript
Package Score = (
  Business Type Match × 0.3 +
  Budget Compatibility × 0.25 +
  Feature Alignment × 0.25 +
  Timeline Fit × 0.1 +
  Size Appropriateness × 0.1
) × 100
```

### Package Performance Analytics

#### Key Metrics
- **Recommendation Frequency**: How often package is suggested
- **Conversion Rate**: Percentage of recommendations leading to inquiries
- **Average Deal Size**: Financial performance per package
- **Client Satisfaction**: Post-implementation feedback scores

---

## Template Customization

### Template Management Interface

Access **Admin → Templates → Consultation Templates** for customization options.

### Industry-Specific Templates

#### Available Industries
- **Technology/SaaS**: Software and tech services
- **E-commerce**: Online retail and marketplaces
- **Healthcare**: Medical and health services
- **Finance**: Financial services and fintech
- **Manufacturing**: Industrial and manufacturing
- **Professional Services**: Consulting and agencies

#### Template Components
1. **Landing Page Configuration**
   - Hero message and value proposition
   - Call-to-action buttons and placement
   - Social proof and testimonials
   - Industry-specific imagery

2. **Questionnaire Design**
   - Industry-relevant questions
   - Question flow and logic
   - Conditional question routing
   - Progress indicators and messaging

3. **Results Page Layout**
   - Report structure and sections
   - Recommendation presentation
   - Service package display
   - Next steps and CTAs

### Custom Template Creation

#### Template Builder Interface
1. **Visual Editor**: Drag-and-drop interface for layout
2. **Question Builder**: Dynamic question creation and logic
3. **Styling Panel**: Colors, fonts, and branding options
4. **Preview Mode**: Real-time template preview
5. **A/B Testing**: Multiple template variants

#### Template Configuration
```yaml
template_config:
  name: "Healthcare Consultation Template"
  industry: "healthcare"
  version: "1.0"
  questions:
    - type: "single_choice"
      id: "practice_type"
      question: "What type of healthcare practice do you operate?"
      options:
        - "Private Practice"
        - "Hospital/Health System"
        - "Urgent Care"
        - "Specialty Clinic"
  styling:
    primary_color: "#2563eb"
    font_family: "Inter"
    layout: "modern"
```

---

## Branding & White-labeling

### Brand Management Dashboard

Navigate to **Admin → Branding** for comprehensive brand customization.

### Logo and Visual Identity

#### Logo Configuration
- **Primary Logo**: Main brand logo (SVG preferred)
- **Secondary Logo**: Alternative/simplified version
- **Favicon**: Browser tab icon
- **Social Media Images**: Open Graph and Twitter cards

#### File Requirements
- **Formats**: SVG, PNG, JPG
- **Size Limits**: 2MB max per file
- **Dimensions**: Responsive design compatible
- **Quality**: High resolution for all devices

### Color Scheme Management

#### Brand Color Palette
```css
:root {
  --brand-primary: #2563eb;
  --brand-secondary: #64748b;
  --brand-accent: #10b981;
  --brand-background: #ffffff;
  --brand-text: #1f2937;
  --brand-muted: #6b7280;
}
```

#### Color Applications
- **Primary**: Main CTAs and headers
- **Secondary**: Supporting elements
- **Accent**: Highlights and success states
- **Background**: Page and section backgrounds
- **Text**: Primary text content
- **Muted**: Secondary text and placeholders

### Typography Settings

#### Font Configuration
- **Primary Font**: Headings and important text
- **Secondary Font**: Body text and paragraphs
- **Monospace Font**: Code and technical content

#### Supported Font Sources
- **Google Fonts**: Extensive library
- **Custom Fonts**: Upload your own fonts
- **System Fonts**: Fallback options

### Custom Domains

#### Domain Configuration
1. **Add Domain**: Enter custom domain name
2. **DNS Configuration**: Set up CNAME records
3. **SSL Certificate**: Automatic HTTPS setup
4. **Validation**: Verify domain ownership
5. **Activation**: Enable custom domain

#### SSL Management
- Automatic certificate provisioning
- Certificate renewal monitoring
- HTTPS enforcement
- Security headers configuration

---

## Content Management

### Content Editor Interface

Access **Admin → Content → Consultation Pages** for content management.

### Landing Page Content

#### Editable Sections
- **Hero Section**: Main headline and subheadline
- **Value Proposition**: Benefits and features
- **Process Overview**: Step-by-step explanation
- **Social Proof**: Testimonials and case studies
- **FAQ Section**: Common questions and answers

#### Content Guidelines
- **Headline**: 6-10 words, action-oriented
- **Subheadline**: 15-25 words, benefit-focused
- **Bullet Points**: 3-5 key benefits
- **CTA Buttons**: Clear, specific action words

### Questionnaire Content

#### Question Management
1. **Question Library**: Pre-built industry questions
2. **Custom Questions**: Create specific questions
3. **Question Logic**: Conditional flow setup
4. **Validation Rules**: Required fields and formats

#### Question Types
- **Single Choice**: Radio button selection
- **Multiple Choice**: Checkbox selection
- **Text Input**: Short text responses
- **Long Text**: Detailed explanations
- **Number Input**: Numeric values
- **Date/Time**: Temporal information
- **File Upload**: Document attachments

### Email Templates

#### Template Types
- **Welcome Email**: Initial consultation confirmation
- **Completion Email**: Report delivery notification
- **Follow-up Email**: Engagement sequence
- **Reminder Email**: Incomplete consultation prompts

#### Email Customization
```html
<!DOCTYPE html>
<html>
<head>
    <title>{{consultation_title}}</title>
</head>
<body>
    <h1>Hello {{client_name}},</h1>
    <p>Your consultation report is ready!</p>

    <div class="report-summary">
        <h2>Key Recommendations:</h2>
        {{#each recommendations}}
        <p>• {{this.title}}</p>
        {{/each}}
    </div>

    <a href="{{report_download_url}}" class="cta-button">
        Download Full Report
    </a>
</body>
</html>
```

---

## Analytics & Reporting

### Analytics Dashboard

Navigate to **Admin → Analytics** for comprehensive insights.

### Key Performance Indicators (KPIs)

#### Consultation Metrics
- **Total Consultations**: Overall volume with time series
- **Completion Rate**: Percentage completing full questionnaire
- **Average Time to Complete**: User engagement duration
- **Bounce Rate**: Users leaving without starting
- **Return Rate**: Users returning to complete

#### Business Metrics
- **Lead Generation**: Consultation to lead conversion
- **Pipeline Value**: Estimated revenue from consultations
- **Service Package Interest**: Most requested packages
- **Geographic Distribution**: User location analysis

### Real-time Analytics

#### Live Dashboard
- **Active Users**: Current consultation sessions
- **Real-time Completions**: Recently finished consultations
- **Performance Metrics**: System response times
- **Error Monitoring**: Technical issues and alerts

#### Alert Configuration
```yaml
alerts:
  completion_rate_drop:
    threshold: "< 70%"
    timeframe: "last_24_hours"
    notification: "slack_webhook"

  response_time_high:
    threshold: "> 5000ms"
    timeframe: "last_hour"
    notification: "email_admin"
```

### Custom Reports

#### Report Builder
1. **Metrics Selection**: Choose data points
2. **Date Range**: Specify time period
3. **Filters**: Segment by criteria
4. **Visualization**: Charts and graphs
5. **Export Options**: PDF, CSV, Excel

#### Scheduled Reports
- **Daily Summary**: Basic metrics overview
- **Weekly Performance**: Detailed analysis
- **Monthly Business Review**: Strategic insights
- **Quarterly Trends**: Long-term patterns

---

## Performance Monitoring

### Performance Dashboard

Access **Admin → Performance** for system monitoring.

### Real-time Monitoring

#### System Health Metrics
- **Response Time**: API and page load performance
- **Error Rate**: System error frequency
- **Uptime**: Service availability percentage
- **Resource Usage**: CPU, memory, and storage

#### Performance Targets
```json
{
  "page_load_time": "< 2 seconds",
  "ai_generation_time": "< 30 seconds",
  "pdf_generation_time": "< 10 seconds",
  "email_delivery_time": "< 5 seconds",
  "api_response_time": "< 500ms",
  "uptime_target": "> 99.9%"
}
```

### Performance Optimization

#### Caching Management
- **Cache Hit Rate**: Efficiency metrics
- **Cache Size**: Memory usage monitoring
- **Cache Invalidation**: Manual and automatic clearing
- **Performance Impact**: Before/after comparisons

#### Database Performance
- **Query Performance**: Slow query identification
- **Connection Pooling**: Resource optimization
- **Index Optimization**: Query acceleration
- **Data Cleanup**: Archive old consultations

### Alerts and Notifications

#### Alert Types
- **Performance Degradation**: Response time issues
- **Error Spikes**: Increased error rates
- **Resource Limits**: CPU/memory thresholds
- **Uptime Issues**: Service availability problems

#### Notification Channels
- **Email Alerts**: Admin email notifications
- **Slack Integration**: Team channel updates
- **SMS Alerts**: Critical issue notifications
- **Dashboard Alerts**: In-app notifications

---

## System Configuration

### Environment Settings

Navigate to **Admin → System → Configuration** for system-wide settings.

### AI Configuration

#### OpenAI Settings
```json
{
  "api_key": "[Configured in environment]",
  "model": "gpt-4",
  "max_tokens": 4000,
  "temperature": 0.7,
  "timeout": 30000,
  "retry_attempts": 3
}
```

#### AI Prompt Management
- **System Prompts**: Base AI instruction sets
- **Industry Prompts**: Specialized consultation prompts
- **Quality Filters**: Response validation rules
- **Fallback Responses**: Backup content for failures

### Email Configuration

#### SMTP Settings
```yaml
email_config:
  provider: "resend"
  from_address: "consultations@yourdomain.com"
  from_name: "Your Company Consultations"
  reply_to: "support@yourdomain.com"

  templates:
    welcome: "consultation-welcome"
    completion: "consultation-complete"
    reminder: "consultation-reminder"
```

### Security Configuration

#### Authentication Settings
- **Session Timeout**: Auto-logout duration
- **Password Policy**: Complexity requirements
- **Two-Factor Authentication**: Enable/disable 2FA
- **IP Whitelisting**: Restrict admin access

#### Data Protection
- **Encryption**: At-rest and in-transit encryption
- **Data Retention**: Automatic cleanup policies
- **Audit Logging**: Action tracking and compliance
- **GDPR Compliance**: Data protection features

---

## User Management

### Admin User Management

Access **Admin → Users** for user administration.

### User Roles and Permissions

#### Role Types
- **Super Admin**: Full system access
- **Admin**: Standard administrative functions
- **Editor**: Content and template management
- **Viewer**: Read-only dashboard access
- **Client Admin**: Client-specific administration

#### Permission Matrix
```
Feature                  | Super | Admin | Editor | Viewer | Client
------------------------|-------|-------|---------|--------|--------
System Configuration    |   ✓   |   ✗   |    ✗   |   ✗    |   ✗
User Management         |   ✓   |   ✓   |    ✗   |   ✗    |   ✗
Content Management      |   ✓   |   ✓   |    ✓   |   ✗    |   ✓*
Analytics Access        |   ✓   |   ✓   |    ✓   |   ✓    |   ✓*
Performance Monitoring  |   ✓   |   ✓   |    ✗   |   ✓    |   ✗
```
*Limited to client-specific data only

### Adding New Users

#### User Creation Process
1. **Basic Information**
   - Full name and email address
   - Role assignment
   - Initial password setup
   - Account activation method

2. **Permission Configuration**
   - Role-based default permissions
   - Custom permission overrides
   - Client access restrictions
   - Feature flag assignments

3. **Notification Setup**
   - Welcome email with login instructions
   - Password reset procedures
   - Account activation requirements
   - Training resource access

---

## Troubleshooting

### Common Issues and Solutions

#### Consultation Loading Issues

**Symptom**: Pages won't load or display errors
**Possible Causes**:
- Database connectivity issues
- Cache corruption
- Template configuration errors
- CDN or asset loading problems

**Diagnostic Steps**:
1. Check **Admin → Performance → System Health**
2. Review error logs in **Admin → Logs**
3. Test database connectivity
4. Clear cache and restart services

**Resolution**:
```bash
# Clear consultation cache
curl -X DELETE "/api/performance/consultation?confirm=true"

# Restart application services
docker restart consultation-app

# Verify system health
curl -f "/api/performance/consultation/health"
```

#### AI Generation Failures

**Symptom**: No recommendations generated or error messages
**Possible Causes**:
- OpenAI API key issues
- Rate limiting exceeded
- Malformed prompts
- Network connectivity problems

**Diagnostic Steps**:
1. Verify API key in **Admin → System → AI Configuration**
2. Check **Admin → Performance → AI Metrics**
3. Review recent AI generation logs
4. Test API connectivity manually

**Resolution**:
```javascript
// Test AI connectivity
const testAI = async () => {
  const response = await fetch('/api/consultation/test-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: true })
  });
  return response.json();
};
```

#### Email Delivery Problems

**Symptom**: Reports not being delivered via email
**Possible Causes**:
- SMTP configuration issues
- Rate limiting from email provider
- Template rendering errors
- Recipient email problems

**Diagnostic Steps**:
1. Check **Admin → System → Email Configuration**
2. Review **Admin → Analytics → Email Metrics**
3. Test email delivery manually
4. Verify recipient email addresses

### Error Log Analysis

#### Log Categories
- **Application Logs**: General system operations
- **Performance Logs**: Response time and resource usage
- **Error Logs**: Exceptions and failures
- **Audit Logs**: User actions and changes
- **Security Logs**: Authentication and access events

#### Log Analysis Tools
- **Real-time Log Viewer**: Live log streaming
- **Log Search**: Filter and search capabilities
- **Error Aggregation**: Grouped error analysis
- **Performance Correlation**: Link errors to performance

---

## Maintenance

### Regular Maintenance Tasks

#### Daily Tasks
- [ ] Review system health dashboard
- [ ] Check error rates and performance metrics
- [ ] Monitor consultation completion rates
- [ ] Verify email delivery success rates

#### Weekly Tasks
- [ ] Review client feedback and support tickets
- [ ] Analyze performance trends and patterns
- [ ] Update service packages based on market feedback
- [ ] Check security logs for anomalies

#### Monthly Tasks
- [ ] Generate comprehensive analytics reports
- [ ] Review and update AI prompts for quality
- [ ] Conduct security audit and updates
- [ ] Plan template improvements based on data
- [ ] Archive old consultation data

### Backup and Recovery

#### Backup Strategy
- **Database Backups**: Daily automated backups
- **File Storage**: Sync to cloud storage
- **Configuration Backups**: Version-controlled settings
- **Code Deployments**: Tagged releases and rollback capability

#### Recovery Procedures
1. **Database Recovery**: Restore from backup with minimal data loss
2. **File Recovery**: Restore uploaded assets and generated reports
3. **Configuration Recovery**: Restore system and client settings
4. **Full System Recovery**: Complete disaster recovery process

### System Updates

#### Update Schedule
- **Security Updates**: Immediate (within 24 hours)
- **Feature Updates**: Monthly scheduled deployments
- **Performance Updates**: As needed based on monitoring
- **Client Requests**: Prioritized in sprint planning

#### Update Process
1. **Staging Testing**: Thorough testing in staging environment
2. **Backup Creation**: Full system backup before deployment
3. **Maintenance Window**: Scheduled downtime notification
4. **Deployment**: Automated deployment with rollback capability
5. **Validation**: Post-deployment testing and monitoring

---

## Support and Resources

### Getting Help

#### Internal Support
- **Documentation**: This guide and API documentation
- **Video Tutorials**: Step-by-step instructional videos
- **Best Practices**: Recommended configurations and workflows
- **FAQ Database**: Common questions and solutions

#### External Support
- **Technical Support**: [support-email]
- **Account Management**: [account-manager-email]
- **Emergency Contact**: [emergency-phone]
- **Community Forum**: [forum-url]

### Training Resources

#### Administrator Training
- **Initial Setup**: System configuration and customization
- **Daily Operations**: Routine monitoring and maintenance
- **Advanced Features**: Complex configurations and integrations
- **Troubleshooting**: Problem diagnosis and resolution

#### Certification Programs
- **Basic Administrator**: Core functionality and management
- **Advanced Administrator**: System optimization and customization
- **Integration Specialist**: API usage and custom development

---

**Document Version**: 1.0
**Last Updated**: September 19, 2025
**Next Review**: December 19, 2025