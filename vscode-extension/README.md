# Hero Tasks VS Code Extension

## Overview

The Hero Tasks VS Code Extension provides seamless integration between your development environment and the Hero Tasks system. It allows you to manage tasks directly from VS Code without switching to a web browser.

## Features

### 📋 Task Management
- **View Tasks**: See all your tasks in the VS Code sidebar
- **Create Tasks**: Create new tasks with title, description, priority, and type
- **Update Status**: Change task status with quick actions
- **Task Details**: View detailed task information in a webview panel

### 📊 Analytics Dashboard
- **Real-time Analytics**: View task completion rates, overdue tasks, and more
- **Status Breakdown**: See distribution of tasks by status
- **Priority Analysis**: Understand task priority distribution
- **Performance Metrics**: Track average task duration

### 🔄 Auto-refresh
- **Automatic Updates**: Tasks refresh automatically at configurable intervals
- **Real-time Sync**: Stay up-to-date with task changes
- **Manual Refresh**: Force refresh when needed

### 🎨 Visual Integration
- **Status Icons**: Visual indicators for task status
- **Priority Colors**: Color-coded priority levels
- **Theme Integration**: Matches VS Code's current theme
- **Responsive Design**: Works with any VS Code theme

## Installation

### From Source
1. Clone the repository
2. Navigate to the `vscode-extension` directory
3. Run `npm install` to install dependencies
4. Run `npm run compile` to build the extension
5. Press `F5` to run the extension in a new Extension Development Host window

### From VSIX Package
1. Download the `.vsix` package
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X`)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded package

## Configuration

The extension can be configured through VS Code settings:

```json
{
  "hero-tasks.apiUrl": "http://localhost:3000",
  "hero-tasks.autoRefresh": true,
  "hero-tasks.refreshInterval": 30000,
  "hero-tasks.showNotifications": true
}
```

### Settings

- **`hero-tasks.apiUrl`**: Hero Tasks API URL (default: `http://localhost:3000`)
- **`hero-tasks.autoRefresh`**: Enable automatic task refresh (default: `true`)
- **`hero-tasks.refreshInterval`**: Auto-refresh interval in milliseconds (default: `30000`)
- **`hero-tasks.showNotifications`**: Show task notifications (default: `true`)

## Usage

### Opening the Extension
1. Click the Hero Tasks icon in the Activity Bar
2. Or use the Command Palette (`Ctrl+Shift+P`) and search for "Hero Tasks"

### Creating Tasks
1. Click the "+" button in the Hero Tasks view
2. Or use the Command Palette: "Hero Tasks: Create New Task"
3. Fill in the task details:
   - Title (required)
   - Description (optional)
   - Priority (critical/high/medium/low)
   - Type (feature/bug_fix/refactor/documentation/test)

### Updating Task Status
1. Right-click on a task in the Hero Tasks view
2. Select "Update Task Status"
3. Choose the new status from the dropdown

### Viewing Task Details
1. Click on any task in the Hero Tasks view
2. A detailed view will open in a new panel

### Viewing Analytics
1. Use the Command Palette: "Hero Tasks: Show Analytics"
2. A comprehensive analytics dashboard will open

## Commands

The extension provides several commands accessible via the Command Palette:

- **Hero Tasks: Open Hero Tasks Panel** - Opens the main Hero Tasks panel
- **Hero Tasks: Create New Task** - Creates a new task
- **Hero Tasks: Refresh Tasks** - Manually refreshes the task list
- **Hero Tasks: Update Task Status** - Updates the status of a selected task
- **Hero Tasks: Show Analytics** - Displays the analytics dashboard

## API Integration

The extension integrates with the Hero Tasks API endpoints:

- `GET /api/hero-tasks` - Fetch all tasks
- `POST /api/hero-tasks` - Create a new task
- `PUT /api/hero-tasks/{id}` - Update a task
- `GET /api/hero-tasks/analytics` - Fetch analytics data

## Development

### Prerequisites
- Node.js 16+
- TypeScript 4.9+
- VS Code Extension Development Host

### Building
```bash
cd vscode-extension
npm install
npm run compile
```

### Testing
```bash
npm run watch
# Press F5 to run in Extension Development Host
```

### Packaging
```bash
npm install -g vsce
vsce package
```

## Troubleshooting

### Common Issues

#### Extension Not Loading
- Check that the Hero Tasks API is running
- Verify the API URL in settings
- Check the VS Code Developer Console for errors

#### Tasks Not Loading
- Ensure the API endpoint is accessible
- Check network connectivity
- Verify API response format

#### Auto-refresh Not Working
- Check the refresh interval setting
- Ensure auto-refresh is enabled
- Restart the extension if needed

### Debug Mode
Enable debug mode by setting `"hero-tasks.debug": true` in your VS Code settings to see detailed logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This extension is part of the OSS Hero project and follows the same licensing terms.

## Support

For issues and feature requests, please use the GitHub issue tracker or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2025-09-08  
**Compatibility**: VS Code 1.74.0+
