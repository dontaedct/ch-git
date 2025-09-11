# Runtime Brand Switching System

## Overview

The Runtime Brand Switching System enables dynamic brand configuration changes without application restart. This system provides smooth transitions, loading states, and comprehensive React integration for seamless brand management.

## Architecture

### Core Components

1. **RuntimeBrandSwitchingService** - Main service for brand switching operations
2. **React Hooks** - Comprehensive React integration for UI components
3. **Transition Components** - Smooth animations and loading states
4. **Event System** - Real-time event handling and notifications
5. **Queue System** - Request queuing and batch processing

### Key Features

- **No Restart Required**: Switch brands without application restart
- **Smooth Transitions**: CSS transitions and animations during switching
- **Loading States**: Visual feedback during brand switching operations
- **Event System**: Real-time events for component synchronization
- **Queue Management**: Batch processing of brand switch requests
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Analytics**: Switch history and performance tracking
- **Keyboard Shortcuts**: Quick brand switching with keyboard shortcuts

## API Reference

### RuntimeBrandSwitchingService

#### `switchBrand(request: BrandSwitchRequest): Promise<BrandSwitchResult>`

Switches to a different brand configuration with smooth transitions.

```typescript
import { runtimeBrandSwitchingService } from '@/lib/config/runtime-brand-switching';

const result = await runtimeBrandSwitchingService.switchBrand({
  brandId: 'corporate-brand',
  options: {
    showLoading: true,
    transitionDuration: 300,
    validateBeforeSwitch: true,
    persistSwitch: true,
    notifyComponents: true
  }
});

if (result.success) {
  console.log('Brand switched successfully!');
  console.log('Duration:', result.duration, 'ms');
} else {
  console.error('Brand switch failed:', result.error);
}
```

#### `queueBrandSwitch(request: BrandSwitchRequest): Promise<void>`

Queues a brand switch request for batch processing.

```typescript
await runtimeBrandSwitchingService.queueBrandSwitch({
  brandId: 'startup-brand',
  options: {
    transitionDuration: 200
  }
});
```

#### `getSwitchState(): BrandSwitchState`

Gets the current brand switching state.

```typescript
const state = runtimeBrandSwitchingService.getSwitchState();
console.log('Active brand:', state.activeBrandId);
console.log('Is switching:', state.isSwitching);
console.log('Progress:', state.switchProgress);
```

#### `getAvailableBrands(): Promise<BrandConfiguration[]>`

Gets all available brand configurations.

```typescript
const brands = await runtimeBrandSwitchingService.getAvailableBrands();
brands.forEach(brand => {
  console.log(`${brand.name}: ${brand.description}`);
});
```

#### `getSwitchHistory(): BrandSwitchHistory[]`

Gets the history of brand switches.

```typescript
const history = runtimeBrandSwitchingService.getSwitchHistory();
console.log('Total switches:', history.length);
console.log('Average duration:', 
  history.reduce((sum, entry) => sum + entry.duration, 0) / history.length
);
```

#### `addEventListener(eventType: string, listener: (event: BrandSwitchEvent) => void): void`

Adds an event listener for brand switch events.

```typescript
runtimeBrandSwitchingService.addEventListener('switch_completed', (event) => {
  console.log('Brand switch completed:', event.data);
});
```

#### `cancelBrandSwitch(): boolean`

Cancels the current brand switch operation.

```typescript
const cancelled = runtimeBrandSwitchingService.cancelBrandSwitch();
if (cancelled) {
  console.log('Brand switch cancelled');
}
```

#### `resetToDefaultBrand(): Promise<BrandSwitchResult>`

Resets to the default brand configuration.

```typescript
const result = await runtimeBrandSwitchingService.resetToDefaultBrand();
```

### React Hooks

#### `useRuntimeBrandSwitching()`

Main hook for runtime brand switching functionality.

```typescript
import { useRuntimeBrandSwitching } from '@/lib/config/runtime-brand-switching-hooks';

function BrandSwitcher() {
  const { 
    switchState, 
    lastResult, 
    error, 
    switchBrand, 
    cancelBrandSwitch 
  } = useRuntimeBrandSwitching();

  const handleSwitch = async () => {
    const result = await switchBrand({
      brandId: 'new-brand',
      options: {
        showLoading: true,
        transitionDuration: 300
      }
    });
    
    if (result.success) {
      console.log('Switch successful!');
    }
  };

  return (
    <div>
      <p>Active Brand: {switchState.activeBrandId}</p>
      <p>Is Switching: {switchState.isSwitching ? 'Yes' : 'No'}</p>
      <p>Progress: {switchState.switchProgress}%</p>
      
      <button onClick={handleSwitch} disabled={switchState.isSwitching}>
        Switch Brand
      </button>
      
      {switchState.isSwitching && (
        <button onClick={cancelBrandSwitch}>
          Cancel Switch
        </button>
      )}
      
      {error && <p className="error">Error: {error}</p>}
    </div>
  );
}
```

#### `useAvailableBrands()`

Hook for managing available brand configurations.

```typescript
import { useAvailableBrands } from '@/lib/config/runtime-brand-switching-hooks';

function BrandSelector() {
  const { 
    brands, 
    loading, 
    error, 
    getBrandById, 
    getBrandsByTag, 
    getPresetBrands 
  } = useAvailableBrands();

  if (loading) return <div>Loading brands...</div>;
  if (error) return <div>Error: {error}</div>;

  const presetBrands = getPresetBrands();
  const corporateBrands = getBrandsByTag('corporate');

  return (
    <div>
      <h3>Preset Brands</h3>
      {presetBrands.map(brand => (
        <div key={brand.id}>
          <h4>{brand.name}</h4>
          <p>{brand.description}</p>
        </div>
      ))}
      
      <h3>Corporate Brands</h3>
      {corporateBrands.map(brand => (
        <div key={brand.id}>
          <h4>{brand.name}</h4>
          <p>{brand.description}</p>
        </div>
      ))}
    </div>
  );
}
```

#### `useBrandSwitchHistory()`

Hook for accessing brand switch history and analytics.

```typescript
import { useBrandSwitchHistory } from '@/lib/config/runtime-brand-switching-hooks';

function SwitchAnalytics() {
  const { 
    history, 
    getRecentSwitches, 
    getSuccessfulSwitches, 
    getAverageSwitchDuration 
  } = useBrandSwitchHistory();

  const recentSwitches = getRecentSwitches(5);
  const successfulSwitches = getSuccessfulSwitches();
  const averageDuration = getAverageSwitchDuration();

  return (
    <div>
      <h3>Switch Analytics</h3>
      <p>Total Switches: {history.length}</p>
      <p>Successful Switches: {successfulSwitches.length}</p>
      <p>Average Duration: {Math.round(averageDuration)}ms</p>
      
      <h4>Recent Switches</h4>
      {recentSwitches.map((entry, index) => (
        <div key={index}>
          <p>{entry.fromBrandId} → {entry.toBrandId}</p>
          <p>Duration: {entry.duration}ms</p>
          <p>Success: {entry.success ? 'Yes' : 'No'}</p>
        </div>
      ))}
    </div>
  );
}
```

#### `useBrandSwitchingWithTransitions()`

Hook for brand switching with smooth transitions.

```typescript
import { useBrandSwitchingWithTransitions } from '@/lib/config/runtime-brand-switching-hooks';

function TransitionalBrandSwitcher() {
  const { 
    switchBrandWithTransition, 
    transitionState, 
    error 
  } = useBrandSwitchingWithTransitions();

  const handleSwitch = async () => {
    await switchBrandWithTransition({
      brandId: 'smooth-brand',
      options: {
        transitionDuration: 500,
        transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    });
  };

  return (
    <div>
      <button onClick={handleSwitch}>
        Switch with Transition
      </button>
      
      {transitionState.isTransitioning && (
        <div>
          <p>Transitioning... {transitionState.transitionProgress}%</p>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${transitionState.transitionProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

#### `useBrandSwitchingWithLoading()`

Hook for brand switching with loading states.

```typescript
import { useBrandSwitchingWithLoading } from '@/lib/config/runtime-brand-switching-hooks';

function LoadingBrandSwitcher() {
  const { 
    switchBrandWithLoading, 
    loadingStates, 
    error 
  } = useBrandSwitchingWithLoading();

  const handleSwitch = async () => {
    await switchBrandWithLoading({
      brandId: 'loading-brand'
    }, 'Switching to new brand...');
  };

  return (
    <div>
      <button onClick={handleSwitch} disabled={loadingStates.isSwitching}>
        Switch Brand
      </button>
      
      {loadingStates.isSwitching && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>{loadingStates.loadingMessage}</p>
          <p>{loadingStates.switchProgress}% complete</p>
          {loadingStates.estimatedTimeRemaining > 0 && (
            <p>~{Math.round(loadingStates.estimatedTimeRemaining / 1000)}s remaining</p>
          )}
        </div>
      )}
    </div>
  );
}
```

#### `useDebouncedBrandSwitching(delay: number)`

Hook for debounced brand switching to prevent rapid switches.

```typescript
import { useDebouncedBrandSwitching } from '@/lib/config/runtime-brand-switching-hooks';

function DebouncedBrandSwitcher() {
  const { 
    debouncedSwitchBrand, 
    cancelDebouncedSwitch, 
    isDebouncing, 
    pendingRequest 
  } = useDebouncedBrandSwitching(500);

  const handleColorChange = (color: string) => {
    debouncedSwitchBrand({
      brandId: 'color-brand',
      brandConfig: {
        brandColors: { primary: color }
      }
    });
  };

  return (
    <div>
      <input 
        type="color" 
        onChange={(e) => handleColorChange(e.target.value)}
      />
      
      {isDebouncing && (
        <div>
          <p>Debouncing switch to {pendingRequest?.brandId}...</p>
          <button onClick={cancelDebouncedSwitch}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
```

#### `useBrandSwitchingWithErrorHandling()`

Hook for brand switching with comprehensive error handling and retry logic.

```typescript
import { useBrandSwitchingWithErrorHandling } from '@/lib/config/runtime-brand-switching-hooks';

function ErrorHandlingBrandSwitcher() {
  const { 
    switchBrandWithRetry, 
    errorHistory, 
    retryCount, 
    maxRetries, 
    clearErrorHistory 
  } = useBrandSwitchingWithErrorHandling();

  const handleSwitch = async () => {
    try {
      await switchBrandWithRetry({
        brandId: 'retry-brand'
      }, 1000); // 1 second retry delay
    } catch (error) {
      console.error('Max retries exceeded:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSwitch}>
        Switch with Retry
      </button>
      
      {retryCount > 0 && (
        <p>Retry attempt: {retryCount}/{maxRetries}</p>
      )}
      
      {errorHistory.length > 0 && (
        <div>
          <h4>Error History</h4>
          {errorHistory.map((error, index) => (
            <p key={index} className="error">{error}</p>
          ))}
          <button onClick={clearErrorHistory}>
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}
```

#### `useBrandSwitchingKeyboardShortcuts()`

Hook for keyboard shortcut support.

```typescript
import { useBrandSwitchingKeyboardShortcuts } from '@/lib/config/runtime-brand-switching-hooks';

function KeyboardShortcuts() {
  useBrandSwitchingKeyboardShortcuts();

  return (
    <div>
      <h3>Keyboard Shortcuts</h3>
      <ul>
        <li><kbd>Ctrl/Cmd + 1-9</kbd> - Switch to brand 1-9</li>
        <li><kbd>Ctrl/Cmd + 0</kbd> - Switch to default brand</li>
      </ul>
    </div>
  );
}
```

### Transition Components

#### `BrandTransitionWrapper`

Wraps content with brand transition animations.

```typescript
import { BrandTransitionWrapper } from '@/components/branding/brand-switching-transitions';

function App() {
  return (
    <BrandTransitionWrapper 
      transitionDuration={300}
      transitionEasing="cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <div className="app-content">
        {/* Your app content */}
      </div>
    </BrandTransitionWrapper>
  );
}
```

#### `BrandSwitchingLoadingOverlay`

Full-screen loading overlay during brand switching.

```typescript
import { BrandSwitchingLoadingOverlay } from '@/components/branding/brand-switching-transitions';

function App() {
  const { switchState } = useRuntimeBrandSwitching();

  return (
    <div>
      {/* Your app content */}
      
      <BrandSwitchingLoadingOverlay
        isVisible={switchState.isSwitching}
        progress={switchState.switchProgress}
        message="Switching brand..."
        estimatedTimeRemaining={2000}
      />
    </div>
  );
}
```

#### `BrandSwitchingProgress`

Inline progress indicator for brand switching.

```typescript
import { BrandSwitchingProgress } from '@/components/branding/brand-switching-transitions';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <BrandSwitchingProgress 
        showPercentage={true}
        showMessage={true}
      />
    </header>
  );
}
```

#### `BrandSwitchingButton`

Button component with built-in brand switching functionality.

```typescript
import { BrandSwitchingButton } from '@/components/branding/brand-switching-transitions';

function BrandButtons() {
  return (
    <div>
      <BrandSwitchingButton
        brandId="corporate"
        brandName="Corporate"
        onSwitch={(result) => console.log('Switched:', result)}
        transitionDuration={300}
      />
      
      <BrandSwitchingButton
        brandId="startup"
        brandName="Startup"
        onSwitch={(result) => console.log('Switched:', result)}
        transitionDuration={200}
      />
    </div>
  );
}
```

#### `BrandSwitchingDropdown`

Dropdown component for brand selection.

```typescript
import { BrandSwitchingDropdown } from '@/components/branding/brand-switching-transitions';

function BrandSelector() {
  return (
    <BrandSwitchingDropdown
      onBrandSelect={(brandId, result) => {
        console.log('Selected brand:', brandId);
        console.log('Switch result:', result);
      }}
    />
  );
}
```

#### `BrandSwitchingNotification`

Notification component for brand switch results.

```typescript
import { BrandSwitchingNotification } from '@/components/branding/brand-switching-transitions';

function NotificationManager() {
  const { lastResult } = useRuntimeBrandSwitching();

  return (
    <div>
      {lastResult && (
        <BrandSwitchingNotification
          result={lastResult}
          autoClose={true}
          autoCloseDelay={3000}
          onClose={() => console.log('Notification closed')}
        />
      )}
    </div>
  );
}
```

## Type Definitions

### BrandSwitchRequest

```typescript
interface BrandSwitchRequest {
  brandId: string;
  brandConfig?: Partial<TenantBrandingConfig>;
  presetName?: string;
  overrides?: BrandConfigOverride[];
  options?: BrandSwitchOptions;
}
```

### BrandSwitchOptions

```typescript
interface BrandSwitchOptions {
  showLoading?: boolean;
  transitionDuration?: number;
  validateBeforeSwitch?: boolean;
  persistSwitch?: boolean;
  notifyComponents?: boolean;
  transitionEasing?: string;
}
```

### BrandSwitchResult

```typescript
interface BrandSwitchResult {
  success: boolean;
  config?: EnhancedAppConfig;
  error?: string;
  duration?: number;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
  };
}
```

### BrandSwitchState

```typescript
interface BrandSwitchState {
  activeBrandId: string;
  isSwitching: boolean;
  switchProgress: number;
  lastSwitchResult?: BrandSwitchResult;
  availableBrands: BrandConfiguration[];
  switchHistory: BrandSwitchHistory[];
}
```

### BrandConfiguration

```typescript
interface BrandConfiguration {
  id: string;
  name: string;
  description?: string;
  config: TenantBrandingConfig;
  isPreset: boolean;
  previewImage?: string;
  tags: string[];
  lastModified: Date;
}
```

## Usage Examples

### Basic Brand Switching

```typescript
import { useRuntimeBrandSwitching } from '@/lib/config/runtime-brand-switching-hooks';

function SimpleBrandSwitcher() {
  const { switchBrand, switchState } = useRuntimeBrandSwitching();

  const switchToCorporate = () => {
    switchBrand({
      brandId: 'corporate',
      options: {
        showLoading: true,
        transitionDuration: 300
      }
    });
  };

  return (
    <button onClick={switchToCorporate} disabled={switchState.isSwitching}>
      Switch to Corporate Brand
    </button>
  );
}
```

### Advanced Brand Switching with Transitions

```typescript
import { useBrandSwitchingWithTransitions } from '@/lib/config/runtime-brand-switching-hooks';

function AdvancedBrandSwitcher() {
  const { switchBrandWithTransition, transitionState } = useBrandSwitchingWithTransitions();

  const switchWithCustomTransition = async () => {
    await switchBrandWithTransition({
      brandId: 'premium-brand',
      options: {
        transitionDuration: 500,
        transitionEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        validateBeforeSwitch: true,
        persistSwitch: true
      }
    });
  };

  return (
    <div>
      <button onClick={switchWithCustomTransition}>
        Switch with Custom Transition
      </button>
      
      {transitionState.isTransitioning && (
        <div className="transition-overlay">
          <div className="transition-progress">
            {transitionState.transitionProgress}%
          </div>
        </div>
      )}
    </div>
  );
}
```

### Brand Switching with Loading States

```typescript
import { useBrandSwitchingWithLoading } from '@/lib/config/runtime-brand-switching-hooks';

function LoadingBrandSwitcher() {
  const { switchBrandWithLoading, loadingStates } = useBrandSwitchingWithLoading();

  const switchWithLoading = async () => {
    await switchBrandWithLoading({
      brandId: 'loading-brand',
      brandConfig: {
        organizationName: 'New Organization',
        brandColors: { primary: '#ff0000' }
      }
    }, 'Applying new brand configuration...');
  };

  return (
    <div>
      <button onClick={switchWithLoading} disabled={loadingStates.isSwitching}>
        Apply New Brand
      </button>
      
      {loadingStates.isSwitching && (
        <div className="loading-state">
          <div className="spinner" />
          <p>{loadingStates.loadingMessage}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${loadingStates.switchProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

### Brand Switching with Error Handling

```typescript
import { useBrandSwitchingWithErrorHandling } from '@/lib/config/runtime-brand-switching-hooks';

function ErrorHandlingBrandSwitcher() {
  const { 
    switchBrandWithRetry, 
    errorHistory, 
    retryCount, 
    clearErrorHistory 
  } = useBrandSwitchingWithErrorHandling();

  const switchWithRetry = async () => {
    try {
      await switchBrandWithRetry({
        brandId: 'unreliable-brand',
        options: {
          validateBeforeSwitch: true
        }
      }, 1000); // 1 second retry delay
    } catch (error) {
      console.error('All retry attempts failed:', error);
    }
  };

  return (
    <div>
      <button onClick={switchWithRetry}>
        Switch with Retry ({retryCount > 0 ? `${retryCount} retries` : 'No retries'})
      </button>
      
      {errorHistory.length > 0 && (
        <div className="error-history">
          <h4>Recent Errors</h4>
          {errorHistory.slice(-3).map((error, index) => (
            <p key={index} className="error-message">{error}</p>
          ))}
          <button onClick={clearErrorHistory}>
            Clear Error History
          </button>
        </div>
      )}
    </div>
  );
}
```

### Complete Brand Management Interface

```typescript
import { 
  useRuntimeBrandSwitching, 
  useAvailableBrands, 
  useBrandSwitchHistory 
} from '@/lib/config/runtime-brand-switching-hooks';
import { 
  BrandSwitchingDropdown, 
  BrandSwitchingProgress, 
  BrandSwitchingNotification 
} from '@/components/branding/brand-switching-transitions';

function BrandManagementInterface() {
  const { switchBrand, switchState, lastResult } = useRuntimeBrandSwitching();
  const { brands, loading: brandsLoading } = useAvailableBrands();
  const { history, getAverageSwitchDuration } = useBrandSwitchHistory();

  const handleBrandSelect = async (brandId: string) => {
    await switchBrand({
      brandId,
      options: {
        showLoading: true,
        transitionDuration: 300,
        validateBeforeSwitch: true,
        persistSwitch: true,
        notifyComponents: true
      }
    });
  };

  if (brandsLoading) {
    return <div>Loading brand configurations...</div>;
  }

  return (
    <div className="brand-management">
      <header>
        <h1>Brand Management</h1>
        <BrandSwitchingProgress />
      </header>

      <main>
        <section>
          <h2>Current Brand</h2>
          <p>Active: {switchState.activeBrandId}</p>
          <p>Status: {switchState.isSwitching ? 'Switching...' : 'Ready'}</p>
        </section>

        <section>
          <h2>Switch Brand</h2>
          <BrandSwitchingDropdown onBrandSelect={handleBrandSelect} />
        </section>

        <section>
          <h2>Available Brands</h2>
          <div className="brand-grid">
            {brands.map(brand => (
              <div key={brand.id} className="brand-card">
                <div 
                  className="brand-color-preview"
                  style={{ backgroundColor: brand.config.brandColors.primary }}
                />
                <h3>{brand.name}</h3>
                <p>{brand.description}</p>
                <button 
                  onClick={() => handleBrandSelect(brand.id)}
                  disabled={switchState.isSwitching}
                >
                  Switch to {brand.name}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Switch Analytics</h2>
          <p>Total Switches: {history.length}</p>
          <p>Average Duration: {Math.round(getAverageSwitchDuration())}ms</p>
          <p>Success Rate: {
            Math.round(
              (history.filter(h => h.success).length / history.length) * 100
            )
          }%
          </p>
        </section>
      </main>

      {lastResult && (
        <BrandSwitchingNotification
          result={lastResult}
          autoClose={true}
          autoCloseDelay={3000}
        />
      )}
    </div>
  );
}
```

## Best Practices

### 1. Use Appropriate Hooks for Your Use Case

- **`useRuntimeBrandSwitching`**: Basic brand switching functionality
- **`useBrandSwitchingWithTransitions`**: When you need smooth animations
- **`useBrandSwitchingWithLoading`**: When you need loading states
- **`useDebouncedBrandSwitching`**: For real-time updates (color pickers, etc.)
- **`useBrandSwitchingWithErrorHandling`**: For critical brand switches

### 2. Handle Loading States Gracefully

```typescript
function BrandSwitcher() {
  const { switchState, switchBrand } = useRuntimeBrandSwitching();

  return (
    <button 
      onClick={() => switchBrand({ brandId: 'new-brand' })}
      disabled={switchState.isSwitching}
    >
      {switchState.isSwitching ? 'Switching...' : 'Switch Brand'}
    </button>
  );
}
```

### 3. Use Transition Components for Better UX

```typescript
function App() {
  return (
    <BrandTransitionWrapper transitionDuration={300}>
      <BrandSwitchingLoadingOverlay />
      <BrandSwitchingProgress />
      {/* Your app content */}
    </BrandTransitionWrapper>
  );
}
```

### 4. Implement Error Handling

```typescript
function RobustBrandSwitcher() {
  const { switchBrand, error } = useRuntimeBrandSwitching();

  const handleSwitch = async () => {
    try {
      await switchBrand({
        brandId: 'new-brand',
        options: {
          validateBeforeSwitch: true
        }
      });
    } catch (error) {
      console.error('Brand switch failed:', error);
      // Show user-friendly error message
    }
  };

  return (
    <div>
      <button onClick={handleSwitch}>Switch Brand</button>
      {error && <div className="error">Error: {error}</div>}
    </div>
  );
}
```

### 5. Use Keyboard Shortcuts for Power Users

```typescript
function App() {
  useBrandSwitchingKeyboardShortcuts();
  
  return (
    <div>
      <p>Press Ctrl+1-9 to switch brands quickly</p>
      {/* Your app content */}
    </div>
  );
}
```

### 6. Monitor Performance

```typescript
function PerformanceMonitor() {
  const { getAverageSwitchDuration } = useBrandSwitchHistory();
  
  useEffect(() => {
    const avgDuration = getAverageSwitchDuration();
    if (avgDuration > 1000) {
      console.warn('Brand switching is taking longer than expected');
    }
  }, [getAverageSwitchDuration]);
  
  return null;
}
```

## Performance Considerations

- **Debounce Real-time Updates**: Use `useDebouncedBrandSwitching` for color pickers and other real-time controls
- **Batch Operations**: Use `queueBrandSwitch` for multiple brand changes
- **Optimize Transitions**: Keep transition durations reasonable (200-500ms)
- **Monitor Performance**: Track switch durations and optimize slow operations
- **Cache Brand Configurations**: Available brands are automatically cached

## Security Considerations

- **Validate Brand Configurations**: Always validate before switching
- **Sanitize User Input**: Validate brand IDs and configuration data
- **Limit Switch Frequency**: Implement rate limiting for rapid switches
- **Audit Switch History**: Track all brand switches for security auditing

---

This runtime brand switching system provides a comprehensive solution for dynamic brand management with smooth transitions, loading states, and robust error handling.
