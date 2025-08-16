# 🧪 MIT HERO SYSTEM - COMPREHENSIVE SMOKE TEST SUITE

## 🌟 Overview

The MIT Hero System Comprehensive Smoke Test Suite provides comprehensive validation of all critical scripts, performance budgets, system health, build processes, and hero system orchestration. This suite ensures that the entire system operates within defined performance constraints and maintains operational excellence.

## 🎯 Test Categories

### 1. 🎯 Critical Scripts (`critical-scripts.smoke.test.ts`)
- **Purpose**: Validates the top 10 most critical scripts in the MIT Hero System
- **Coverage**: Build system, health checks, core operations, performance monitoring, system orchestration, CI operations
- **Performance Budgets**: Time, memory, and CPU constraints for each script
- **Validation**: Script execution success, performance within budgets, output validation

**Critical Scripts Tested**:
- 🏗️ `build:fast` - Fast development build (15s, 256MB, 70% CPU)
- 💾 `build:memory` - Memory-optimized build (45s, 1GB, 90% CPU)
- 🏥 `doctor:lightweight` - Lightweight system health check (2min, 256MB, 60% CPU)
- 🛡️ `guardian:health` - Guardian system health check (30s, 128MB, 50% CPU)
- 🔍 `lint:fast` - Fast linting check (1min, 128MB, 40% CPU)
- 📝 `typecheck` - TypeScript type checking (1.5min, 256MB, 60% CPU)
- 📊 `build:performance` - Build performance monitoring (1min, 256MB, 60% CPU)
- 🧠 `memory:detect` - Memory leak detection (45s, 128MB, 50% CPU)
- 🦸‍♂️ `hero:unified:status` - Hero unified system status (1min, 256MB, 60% CPU)
- 🚀 `ci:fast` - Fast CI pipeline (3min, 512MB, 70% CPU)

### 2. ⚡ Performance Budgets (`performance-budgets.smoke.test.ts`)
- **Purpose**: Comprehensive performance budget validation for all critical operations
- **Coverage**: Build system, health checks, core development, performance monitoring, hero systems, CI pipelines
- **Metrics**: Execution time, memory usage, CPU usage, peak memory, performance scores
- **Analysis**: Performance trends, budget exceedances, optimization recommendations

### 3. 🏥 System Health (`system-health.smoke.test.ts`)
- **Purpose**: Monitors overall system health and resource utilization
- **Coverage**: Memory usage, CPU usage, system uptime, health checks, cleanup verification
- **Thresholds**: Configurable thresholds for resource usage and health scores
- **Recommendations**: Automated recommendations for system optimization

**Health Checks Performed**:
- 🏥 System Doctor (lightweight)
- 🛡️ Guardian Health Check
- 🦸‍♂️ Hero System Status
- 🧠 Memory Leak Detection
- 📝 TypeScript Type Checking

### 4. 🏗️ Build System (`build-system.smoke.test.ts`)
- **Purpose**: Validates all build configurations and their performance
- **Coverage**: Fast builds, memory-optimized builds, performance monitoring, build monitoring
- **Artifacts**: Build output validation, size constraints, cleanup verification
- **Performance**: Time, memory, and CPU budgets for each build type

**Build Configurations Tested**:
- ⚡ `build:fast` - Fast development build
- 💾 `build:memory` - Memory-optimized build
- 📊 `build:performance` - Build performance monitoring
- 🔍 `build:monitor` - Build monitoring and analysis

### 5. 🦸‍♂️ Hero Systems (`hero-systems.smoke.test.ts`)
- **Purpose**: Validates hero system orchestration and integration
- **Coverage**: Unified hero system, ultimate hero system, guardian integration, threat response
- **Validation**: System status, health checks, output validation, performance monitoring
- **Criticality**: Distinguishes between critical and non-critical systems

**Hero Systems Tested**:
- 🦸‍♂️ Hero Unified System (status, health, execution)
- 🚀 Hero Ultimate System (status, health)
- 🛡️ Guardian System (health, status)
- 🚨 Threat Response Systems (scan, status)
- 🔄 System Orchestration (overview, health test)

### 6. 🚀 Comprehensive Suite (`index.smoke.test.ts`)
- **Purpose**: Orchestrates all smoke test categories and provides unified reporting
- **Coverage**: All test categories with comprehensive analysis
- **Reporting**: Unified status, health scores, recommendations, execution metrics
- **Integration**: Seamless integration of all test categories

## ⚡ Performance Budgets

### Budget Categories

1. **🏗️ Build System Budgets**
   - Standard build: 30s, 512MB, 80% CPU
   - Fast build: 15s, 256MB, 70% CPU
   - Memory build: 45s, 1GB, 90% CPU

2. **🏥 Health Check Budgets**
   - Doctor: 2min, 256MB, 60% CPU
   - Lightweight doctor: 1min, 128MB, 50% CPU
   - Guardian: 30s, 128MB, 50% CPU

3. **⚙️ Core Development Budgets**
   - Lint: 1min, 128MB, 40% CPU
   - Fast lint: 30s, 64MB, 30% CPU
   - Typecheck: 1.5min, 256MB, 60% CPU

4. **📊 Performance Monitoring Budgets**
   - Memory detection: 45s, 128MB, 50% CPU
   - Memory profiling: 1.5min, 256MB, 60% CPU
   - CPU profiling: 1.5min, 256MB, 60% CPU

5. **🦸‍♂️ Hero System Budgets**
   - Unified system: 1min, 256MB, 60% CPU
   - Status checks: 30s, 128MB, 40% CPU
   - Health checks: 45s, 128MB, 50% CPU

6. **🚀 CI Pipeline Budgets**
   - Full CI: 5min, 1GB, 80% CPU
   - Fast CI: 3min, 512MB, 70% CPU
   - Memory CI: 4min, 1.5GB, 85% CPU

## Usage

### Running Smoke Tests

#### Jest-based Tests
```bash
# Run all smoke tests
npm run test:smoke

# Run specific categories
npm run test:smoke:critical      # Critical scripts only
npm run test:smoke:performance   # Performance budget tests only
npm run test:smoke:health        # System health tests only
npm run test:smoke:build         # Build system tests only
npm run test:smoke:hero          # Hero system tests only
npm run test:smoke:comprehensive # All categories together

# Run with performance focus
npm run test:smoke:performance
```

#### Smoke Runner Script
```bash
# Run all smoke tests
npm run smoke:runner

# Run with performance validation
npm run smoke:runner:performance

# Run specific categories
npm run smoke:runner:critical
npm run smoke:runner:health
npm run smoke:runner:build
npm run smoke:runner:hero
```

### Command Line Options

The smoke runner supports various command line options:

```bash
node scripts/smoke-runner.js [options]

Options:
  --performance    Enable performance budget validation
  --critical       Run only critical script tests
  --health         Run only health check tests
  --build          Run only build system tests
  --hero           Run only hero system tests
  --verbose        Enable verbose output
  --help           Show help message
```

## Test Configuration

### Jest Configuration

The smoke tests are configured to work with Jest and include:
- Extended timeouts for long-running operations
- Performance monitoring and validation
- Comprehensive error reporting
- Detailed test categorization

### Performance Budget Configuration

Performance budgets are centrally configured in `performance-budgets.config.ts`:
- Categorized by system area
- Configurable thresholds
- Validation utilities
- Easy maintenance and updates

## Reporting

### Test Reports

Each test category generates detailed reports including:
- Execution status (pass/fail)
- Performance metrics
- Budget compliance
- Recommendations
- Error details

### Comprehensive Reporting

The main suite provides unified reporting:
- Overall system status
- Category-by-category results
- Performance analysis
- Optimization recommendations
- Execution metrics

### Report Formats

Reports are generated in console format with:
- Emoji indicators for quick status assessment
- Detailed metrics and thresholds
- Performance scores and trends
- Actionable recommendations

## Integration

### CI/CD Integration

The smoke test suite integrates with CI/CD pipelines:
- Automated execution on code changes
- Performance regression detection
- Build validation
- System health monitoring

### Monitoring Integration

Tests can be integrated with monitoring systems:
- Performance metrics collection
- Health status reporting
- Alert generation
- Trend analysis

## Maintenance

### Adding New Tests

To add new smoke tests:
1. Create test file in appropriate category
2. Define performance budgets in configuration
3. Implement test logic with validation
4. Add to comprehensive suite
5. Update documentation

### Updating Budgets

To modify performance budgets:
1. Update `performance-budgets.config.ts`
2. Adjust thresholds as needed
3. Test with existing scripts
4. Update documentation
5. Validate changes

### Troubleshooting

Common issues and solutions:
- **Timeout errors**: Increase Jest timeout or optimize slow operations
- **Memory issues**: Review memory budgets and optimize memory usage
- **CPU constraints**: Optimize CPU-intensive operations
- **Test failures**: Check script availability and dependencies

## Best Practices

### Test Design
- Keep tests focused and specific
- Use appropriate timeouts
- Implement proper cleanup
- Validate both success and failure cases

### Performance Monitoring
- Set realistic budgets
- Monitor trends over time
- Alert on budget exceedances
- Regular optimization reviews

### Maintenance
- Regular test execution
- Performance trend analysis
- Budget adjustments as needed
- Documentation updates

## Conclusion

The MIT Hero System Comprehensive Smoke Test Suite provides a robust foundation for ensuring system reliability, performance, and operational excellence. By covering all critical areas with comprehensive validation and performance monitoring, it helps maintain the high standards expected of the MIT Hero System.

Regular execution of these tests, combined with ongoing monitoring and optimization, ensures that the system continues to operate at peak performance while maintaining stability and reliability.
