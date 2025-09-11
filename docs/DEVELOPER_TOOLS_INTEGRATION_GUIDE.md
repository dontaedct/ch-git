# Developer Tools Integration - HT-004.4.5

## Overview

This document provides comprehensive guidance for using the Hero Tasks CLI tool and VS Code extension for seamless development workflow integration.

## 🚀 Quick Start

### CLI Tool
```bash
# Install and use the CLI tool
npm install
npx hero-tasks list
npx hero-tasks create
npx hero-tasks help
```

### VS Code Extension
1. Open VS Code
2. Install the Hero Tasks extension
3. Click the Hero Tasks icon in the Activity Bar
4. Start managing tasks directly from your editor

## 📋 CLI Tool Features

### Available Commands

#### List Tasks
```bash
hero-tasks list
# Shows all tasks with status, priority, and due dates
```

#### Create Task
```bash
hero-tasks create
# Interactive task creation with prompts for:
# - Title (required)
# - Description (optional)
# - Priority (critical/high/medium/low)
# - Type (feature/bug_fix/refactor/documentation/test)
```

#### Update Task Status
```bash
hero-tasks update
# Interactive status update with prompts for:
# - Task number (e.g., HT-001)
# - New status (draft/ready/in_progress/completed/blocked/cancelled)
```

#### Search Tasks
```bash
hero-tasks search
# Interactive search with text query
# Searches task titles and descriptions
```

#### Show Analytics
```bash
hero-tasks analytics
# Displays comprehensive task analytics:
# - Total tasks and completion rate
# - Overdue and blocked tasks
# - Status and priority breakdowns
# - Average duration metrics
```

#### Delete Task
```bash
hero-tasks delete
# Interactive task deletion with confirmation
# Shows task details before deletion
```

### CLI Configuration

Set environment variables to configure the CLI:

```bash
# API endpoint (default: http://localhost:3000)
export NEXT_PUBLIC_APP_URL="https://your-hero-tasks-app.com"

# Run CLI commands
hero-tasks list
```

## 🎯 VS Code Extension Features

### Task Management
- **Sidebar Integration**: View all tasks in the VS Code sidebar
- **Quick Actions**: Create, update, and manage tasks with right-click menus
- **Status Indicators**: Visual status icons and priority colors
- **Auto-refresh**: Automatic task updates at configurable intervals

### Task Creation
1. Click the "+" button in the Hero Tasks view
2. Or use Command Palette: "Hero Tasks: Create New Task"
3. Fill in task details with dropdowns and input fields

### Task Details
- **Webview Panel**: Detailed task information in a formatted panel
- **Rich Formatting**: Status colors, priority indicators, and metadata
- **Responsive Design**: Adapts to VS Code's current theme

### Analytics Dashboard
- **Real-time Metrics**: Task completion rates and statistics
- **Visual Breakdowns**: Status and priority distribution charts
- **Performance Tracking**: Average task duration and trends

### Configuration
```json
{
  "hero-tasks.apiUrl": "http://localhost:3000",
  "hero-tasks.autoRefresh": true,
  "hero-tasks.refreshInterval": 30000,
  "hero-tasks.showNotifications": true
}
```

## 🔧 API Integration

Both tools integrate with the Hero Tasks API:

### Endpoints Used
- `GET /api/hero-tasks` - Fetch all tasks
- `POST /api/hero-tasks` - Create new task
- `PUT /api/hero-tasks/{id}` - Update task
- `DELETE /api/hero-tasks/{id}` - Delete task
- `POST /api/hero-tasks/search` - Search tasks
- `GET /api/hero-tasks/analytics` - Fetch analytics

### Authentication
Currently uses public API endpoints. Future versions will support authentication.

## 📊 Usage Examples

### CLI Examples

#### Daily Task Management
```bash
# Check today's tasks
hero-tasks list

# Create a new bug fix task
hero-tasks create
# Title: Fix login validation
# Description: Users can't log in with special characters
# Priority: high
# Type: bug_fix

# Update task status
hero-tasks update
# Task number: HT-001
# New status: in_progress

# Check analytics
hero-tasks analytics
```

#### Batch Operations
```bash
# Search for specific tasks
hero-tasks search
# Query: authentication

# Delete completed tasks
hero-tasks delete
# Task number: HT-001
# Confirm: yes
```

### VS Code Examples

#### Development Workflow
1. **Start Development**: Open Hero Tasks panel
2. **Create Task**: Click "+" to create new feature task
3. **Track Progress**: Update status as you work
4. **View Details**: Click task to see full details
5. **Monitor Analytics**: Check completion rates

#### Team Collaboration
1. **Task Assignment**: Create tasks for team members
2. **Status Updates**: Update task status as work progresses
3. **Progress Tracking**: Monitor team productivity with analytics
4. **Issue Tracking**: Create bug fix tasks for issues

## 🛠 Development Setup

### CLI Tool Development
```bash
# Navigate to project root
cd /path/to/hero-tasks-project

# Make CLI executable
chmod +x bin/hero-tasks-cli.js

# Test CLI
node bin/hero-tasks-cli.js help
```

### VS Code Extension Development
```bash
# Navigate to extension directory
cd vscode-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run in Extension Development Host
# Press F5 in VS Code
```

## 🔒 Security Considerations

### API Security
- **HTTPS**: Use HTTPS endpoints in production
- **Authentication**: Future versions will support API keys
- **Rate Limiting**: Respect API rate limits
- **Input Validation**: All inputs are validated before API calls

### Local Security
- **Environment Variables**: Store sensitive data in environment variables
- **Token Management**: Secure API token storage
- **Network Security**: Use secure network connections

## 📈 Performance Optimization

### CLI Performance
- **Caching**: API responses cached for better performance
- **Batch Operations**: Efficient batch task operations
- **Error Handling**: Comprehensive error handling and recovery

### VS Code Extension Performance
- **Lazy Loading**: Tasks loaded on demand
- **Efficient Updates**: Only refresh changed data
- **Memory Management**: Proper cleanup of resources

## 🧪 Testing

### CLI Testing
```bash
# Test all commands
hero-tasks help
hero-tasks list
hero-tasks create
hero-tasks update
hero-tasks search
hero-tasks analytics
hero-tasks delete
```

### VS Code Extension Testing
1. Open Extension Development Host
2. Test all commands via Command Palette
3. Verify task creation and updates
4. Check analytics display
5. Test auto-refresh functionality

## 🐛 Troubleshooting

### Common Issues

#### CLI Not Working
- **Check Installation**: Ensure `bin/hero-tasks-cli.js` exists and is executable
- **API Connection**: Verify API endpoint is accessible
- **Environment**: Check environment variables

#### VS Code Extension Not Loading
- **API Connection**: Ensure Hero Tasks API is running
- **Settings**: Check extension settings
- **Developer Console**: Check for errors in VS Code Developer Console

#### Tasks Not Loading
- **Network**: Check network connectivity
- **API Status**: Verify API is responding
- **Authentication**: Check if authentication is required

### Debug Mode

#### CLI Debug
```bash
# Enable verbose output
DEBUG=true hero-tasks list
```

#### VS Code Extension Debug
```json
{
  "hero-tasks.debug": true
}
```

## 🚀 Future Enhancements

### Planned Features
- **Authentication**: API key authentication
- **Offline Support**: Local task caching
- **Git Integration**: Link tasks to commits
- **Time Tracking**: Built-in time tracking
- **Team Features**: Multi-user support
- **Custom Commands**: User-defined CLI commands

### API Improvements
- **WebSocket Support**: Real-time updates
- **Batch Operations**: Bulk task operations
- **Advanced Search**: Complex search queries
- **Export Features**: Task export capabilities

## 📞 Support

### Getting Help
1. Check this documentation
2. Review error messages
3. Check API status
4. Contact development team

### Reporting Issues
- **CLI Issues**: Report via GitHub issues
- **VS Code Extension**: Use VS Code issue tracker
- **API Issues**: Contact API support team

---

**Implementation Status**: ✅ COMPLETED  
**Task**: HT-004.4.5 - Developer Tools Integration  
**Completion Date**: 2025-09-08T17:10:48.000Z  
**Estimated Hours**: 4  
**Actual Hours**: 4
