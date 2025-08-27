# Auto-Save System

The Micro App Template Auto-Save System is a comprehensive solution that automatically saves user work and provides intelligent recovery across browser sessions, crashes, and page refreshes. It's designed to work

## Features

### 🚀 Core Features
- **Real-time Auto-save**: Saves content every second as users type
- **Intelligent Debouncing**: Prevents excessive saves while maintaining responsiveness
- **Cross-session Persistence**: Work survives browser crashes, refreshes, and restarts
- **Smart Recovery**: Automatically detects and restores unsaved work
- **Form Support**: Works with any HTML form, input, or textarea
- **Content-editable Support**: Handles rich text editing areas

### 🛡️ Advanced Features
- **Compression & Encryption**: Automatically compresses and encrypts stored data
- **Storage Management**: Intelligent cleanup of old entries and size management
- **Development Mode**: Enhanced auto-save during development with file watching
- **Export/Import**: Backup and restore auto-save data
- **Status Monitoring**: Real-time status indicators and statistics

## Architecture

### Core Components

1. **AutoSaveManager** (`@lib/auto-save/index.ts`)
   - Main orchestrator for the auto-save system
   - Handles event listening, storage, and recovery
   - Manages auto-save entries and lifecycle

2. **StorageManager** (`@lib/auto-save/storage.ts`)
   - Robust storage with localStorage/sessionStorage fallbacks
   - Compression, encryption, and TTL support
   - Automatic cleanup and size management

3. **DevelopmentFileWatcher** (`@lib/auto-save/file-watcher.ts`)
   - Monitors file changes during development
   - Enhanced auto-save for development workflows
   - Next.js integration

4. **React Hooks** (`@hooks/use-auto-save.ts`)
   - Easy integration with React components
   - Specialized hooks for different element types
   - Automatic setup and cleanup

5. **UI Components**
   - **AutoSaveRecovery**: Automatic recovery notification
   - **AutoSaveStatus**: Status indicator and controls

## Quick Start

### 1. Basic Input Auto-Save

```tsx
import { useAutoSaveInput } from '@hooks/use-auto-save';

function MyComponent() {
  const autoSave = useAutoSaveInput('unique-input-id');
  
  return (
    <Input
      ref={autoSave.setElementRef}
      placeholder="This will auto-save automatically"
    />
  );
}
```

### 2. Form Auto-Save

```tsx
import { useAutoSaveForm } from '@hooks/use-auto-save';

function MyForm() {
  const formAutoSave = useAutoSaveForm('my-form');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Clear auto-save data after successful submission
    formAutoSave.clearAutoSave();
    // ... submit logic
  };
  
  return (
    <form ref={formAutoSave.setElementRef} onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  );
}
```

### 3. Textarea Auto-Save

```tsx
import { useAutoSaveTextarea } from '@hooks/use-auto-save';

function MyNotes() {
  const notesAutoSave = useAutoSaveTextarea('notes-field');
  
  return (
    <Textarea
      ref={notesAutoSave.setElementRef}
      placeholder="Your notes will be saved automatically"
      rows={10}
    />
  );
}
```

### 4. Content-editable Auto-Save

```tsx
import { useAutoSaveContentEditable } from '@hooks/use-auto-save';

function RichTextEditor() {
  const editorAutoSave = useAutoSaveContentEditable('rich-editor');
  
  return (
    <div
      ref={editorAutoSave.setElementRef}
      contentEditable
      className="min-h-[200px] border rounded p-3"
    >
      Start typing here...
    </div>
  );
}
```

## Configuration

### AutoSaveManager Configuration

```tsx
import { AutoSaveManager } from '@lib/auto-save';

const customAutoSave = new AutoSaveManager({
  debounceMs: 2000,        // Save after 2 seconds of inactivity
  maxEntries: 50,          // Keep only 50 most recent entries
  storageKey: 'my-app-auto-save',
  enableRecovery: true,
  storageOptions: {
    persistent: true,       // Use localStorage instead of sessionStorage
    compress: true,         // Enable compression
    encrypt: true,          // Enable encryption
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days TTL
  },
});
```

### Storage Options

```tsx
import { storageManager } from '@lib/auto-save/storage';

// Store with options
storageManager.set('key', 'value', {
  persistent: true,         // Use localStorage
  compress: true,           // Compress if > 1KB
  encrypt: true,            // Encrypt the data
  ttl: 24 * 60 * 60 * 1000, // 24 hours TTL
});

// Retrieve data
const value = storageManager.get('key', { persistent: true });
```

## API Reference

### AutoSaveManager Methods

```tsx
const autoSave = new AutoSaveManager();

// Check for unsaved changes
const hasChanges = autoSave.hasUnsavedChanges();

// Get all unsaved entries
const entries = autoSave.getUnsavedEntries();

// Get entries for specific path
const pathEntries = autoSave.getEntriesForPath('/current-page');

// Attempt recovery
const recovered = await autoSave.attemptRecovery();

// Force save
autoSave.forceSave();

// Clear specific entry
autoSave.clearEntry('entry-id');

// Clear all entries
autoSave.clearAllEntries();
```

### Hook Return Values

```tsx
const autoSave = useAutoSaveInput('id');

// Set element reference
autoSave.setElementRef(element);

// Manual save
autoSave.saveContent('content');

// Manual restore
autoSave.restoreContent();

// Clear auto-save data
autoSave.clearAutoSave();

// Check for unsaved changes
const hasChanges = autoSave.hasUnsavedChanges();
```

### StorageManager Methods

```tsx
import { storageManager } from '@lib/auto-save/storage';

// Basic operations
storageManager.set('key', 'value', options);
storageManager.get('key', options);
storageManager.remove('key', options);
storageManager.has('key', options);

// Bulk operations
storageManager.keys(options);
storageManager.clear(options);

// Data management
storageManager.exportData();
storageManager.importData(data);

// Statistics
const size = storageManager.getStorageSize();
```

## Integration Examples

### 1. Existing Form Integration

```tsx
// Add to existing form without changing state management
function ExistingForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const formAutoSave = useAutoSaveForm('existing-form');
  
  useEffect(() => {
    if (formRef.current) {
      formAutoSave.setElementRef(formRef.current);
    }
  }, []);
  
  return (
    <form ref={formRef}>
      {/* Existing form content */}
    </form>
  );
}
```

### 2. Custom Auto-save Logic

```tsx
function CustomAutoSave() {
  const autoSave = useAutoSaveInput('custom', {
    onSave: (content) => {
      console.log('Content saved:', content);
      // Custom save logic
    },
    onRestore: (content) => {
      console.log('Content restored:', content);
      // Custom restore logic
    },
  });
  
  return <Input ref={autoSave.setElementRef} />;
}
```

### 3. Conditional Auto-save

```tsx
function ConditionalAutoSave() {
  const [enableAutoSave, setEnableAutoSave] = useState(true);
  const autoSave = useAutoSaveInput('conditional', {
    autoRestore: enableAutoSave,
  });
  
  return (
    <div>
      <Switch
        checked={enableAutoSave}
        onCheckedChange={setEnableAutoSave}
      />
      <Input 
        ref={enableAutoSave ? autoSave.setElementRef : undefined}
        disabled={!enableAutoSave}
      />
    </div>
  );
}
```

## Recovery System

### Automatic Recovery

The system automatically detects when you return to a page with unsaved work and shows a recovery notification. Users can:

- **Restore**: Click to restore specific entries
- **Dismiss**: Ignore specific entries
- **Dismiss All**: Clear all unsaved work

### Manual Recovery

```tsx
// Force recovery check
const entries = await autoSaveManager.attemptRecovery();

// Manual restore for specific entry
const entry = autoSaveManager.restoreEntry('entry-id');
if (entry) {
  // Apply the restored content
  element.value = entry.content;
}
```

## Development Features

### File Watching

During development, the system automatically:

- Monitors for file changes
- Enhances auto-save frequency
- Provides development-specific recovery
- Integrates with Next.js HMR

### Enhanced Logging

```tsx
// Development console shows:
🚀 Auto-save system initialized
🔍 Development file watcher started
🔄 Found 3 entries for recovery
🔄 Development: Found 2 entries for recovery
```

## Performance Considerations

### Storage Limits

- **Default Limit**: 10MB total storage
- **Automatic Cleanup**: Removes oldest entries when limit reached
- **Compression**: Automatically compresses data > 1KB
- **TTL Support**: Automatic expiration of old data

### Debouncing

- **Default**: 1 second debounce
- **Configurable**: Adjust per instance
- **Smart**: Only saves when content actually changes

### Memory Management

- **Entry Limits**: Configurable maximum entries
- **Automatic Cleanup**: Removes expired and old entries
- **Efficient Storage**: Uses Map for fast lookups

## Troubleshooting

### Common Issues

1. **Auto-save not working**
   - Check if element has proper ID
   - Verify hook is properly connected
   - Check browser console for errors

2. **Recovery not showing**
   - Ensure AutoSaveRecovery component is mounted
   - Check if there are actual unsaved entries
   - Verify storage permissions

3. **Storage errors**
   - Check browser storage limits
   - Verify localStorage/sessionStorage availability
   - Check for storage quota exceeded errors

### Debug Mode

```tsx
// Enable debug logging
localStorage.setItem('auto-save-debug', 'true');

// Check storage contents
const data = storageManager.exportData();
console.log('Auto-save data:', data);

// Check auto-save entries
const entries = autoSaveManager.getUnsavedEntries();
console.log('Unsaved entries:', entries);
```

## Best Practices

### 1. Unique IDs
Always use unique, descriptive IDs for auto-save hooks:

```tsx
// Good
const nameAutoSave = useAutoSaveInput('user-profile-name');

// Bad
const nameAutoSave = useAutoSaveInput('input');
```

### 2. Cleanup After Submission
Clear auto-save data after successful form submission:

```tsx
const handleSubmit = async (data) => {
  try {
    await submitForm(data);
    // Clear auto-save after successful submission
    formAutoSave.clearAutoSave();
  } catch (error) {
    // Keep auto-save data if submission fails
    console.error('Submission failed:', error);
  }
};
```

### 3. Conditional Auto-save
Disable auto-save for read-only or disabled states:

```tsx
const autoSave = useAutoSaveInput('field', {
  autoRestore: !isReadOnly,
});

return (
  <Input
    ref={isReadOnly ? undefined : autoSave.setElementRef}
    disabled={isReadOnly}
  />
);
```

### 4. Storage Management
Monitor storage usage and implement cleanup strategies:

```tsx
useEffect(() => {
  const size = storageManager.getStorageSize();
  if (size > 5 * 1024 * 1024) { // 5MB
    console.warn('Auto-save storage is getting large');
    // Implement cleanup strategy
  }
}, []);
```

## Migration Guide

### From Manual Save

1. **Replace manual save buttons** with auto-save hooks
2. **Keep existing state management** - hooks work alongside it
3. **Add recovery UI** for better user experience
4. **Test thoroughly** to ensure compatibility

### From Other Auto-save Systems

1. **Export existing data** from old system
2. **Import into new system** using StorageManager
3. **Update component references** to use new hooks
4. **Verify functionality** matches expectations

## Future Enhancements

### Planned Features

- **Cloud Sync**: Sync auto-save data across devices
- **Collaborative Editing**: Real-time collaboration with auto-save
- **Advanced Compression**: Better compression algorithms
- **Analytics**: Usage statistics and insights
- **Custom Storage Backends**: Support for IndexedDB, WebSQL

### Extension Points

The system is designed to be extensible:

- **Custom Storage Providers**: Implement custom storage backends
- **Custom Recovery Logic**: Define custom recovery strategies
- **Custom Compression**: Implement custom compression algorithms
- **Custom Encryption**: Add custom encryption methods

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify storage permissions and quotas
4. Test with minimal configuration
5. Check for conflicts with other auto-save systems

---

**Note**: This auto-save system is designed to be production-ready and handles edge cases like storage limits, browser compatibility, and error recovery. It's been tested across different browsers and scenarios to ensure reliability.
