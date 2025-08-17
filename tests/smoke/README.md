# 🧪 MIT HERO SYSTEM SMOKE TESTS

This directory contains comprehensive smoke tests for the MIT Hero System to validate that all critical scripts work correctly and meet performance budgets.

## 🌟 Overview

The smoke test suite covers:
- 🏗️ **Build System**: build, build:fast, build:memory
- 🏥 **Health Checks**: doctor, guardian, hero systems
- ⚙️ **Core Operations**: lint, typecheck, test
- 📊 **Performance Monitoring**: build:performance, memory:detect
- 🦸‍♂️ **System Orchestration**: hero:unified, guardian

## 📁 Test Structure

- `critical-scripts.smoke.test.ts` - 🎯 Tests for top 10 critical scripts
- `performance-budgets.smoke.test.ts` - ⚡ Performance budget validation
- `system-health.smoke.test.ts` - 🏥 System health and resource monitoring
- `build-system.smoke.test.ts` - 🏗️ Build system validation
- `hero-systems.smoke.test.ts` - 🦸‍♂️ Hero system orchestration tests
- `index.smoke.test.ts` - 🚀 Comprehensive test orchestrator

## 🚀 Running Tests

```bash
# Run all smoke tests
npm run test:smoke

# Run smoke tests with performance validation
npm run test:smoke:performance

# Run specific smoke test categories
npm run test:smoke:critical
npm run test:smoke:performance
npm run test:smoke:health
npm run test:smoke:build
npm run test:smoke:hero

# Use the smoke runner directly
npm run smoke:runner
npm run smoke:runner:performance
npm run smoke:runner:critical
```

## ⚡ Performance Budgets

Each test includes performance budgets for:
- ⏱️ **Execution Time Limits**: Maximum allowed execution time
- 💾 **Memory Usage Limits**: Maximum allowed memory consumption
- 🔥 **CPU Usage Limits**: Maximum allowed CPU utilization
- 🧹 **Resource Cleanup Validation**: Automatic cleanup verification

## 📊 Test Reporting

Tests provide detailed reporting including:
- 📈 **Performance Metrics**: Time, memory, CPU usage
- 📊 **Resource Usage Statistics**: Peak usage and trends
- 🧹 **Cleanup Verification**: Resource cleanup validation
- 🚨 **Failure Analysis**: Detailed error reporting
- 📈 **Performance Trend Tracking**: Historical performance data

## 🔄 Integration

The smoke test suite integrates with:
- 🚀 **CI/CD Pipelines**: Automated testing and validation
- 📊 **Performance Monitoring**: Real-time performance tracking
- 📈 **Resource Tracking**: Memory and CPU monitoring
- 📋 **Automated Reporting**: Comprehensive test reports
- 🏥 **Health Dashboards**: System health visualization

## 🎯 MIT Hero System Compliance

- ✅ **Universal Header Rules**: Follows AUDIT → DECIDE → APPLY → VERIFY pattern
- ✅ **Performance Budgets**: Enforces strict performance constraints
- ✅ **Resource Management**: Automatic cleanup and optimization
- ✅ **Integration Testing**: Validates all Hero system components
- ✅ **Fail-Fast Detection**: Immediate issue identification and reporting

## 🔧 Configuration

Performance budgets are configured in `performance-budgets.config.ts` and can be customized based on system requirements and performance targets.

## 📝 Maintenance

- **Regular Updates**: Performance budgets should be reviewed monthly
- **Trend Analysis**: Monitor performance trends over time
- **Integration Testing**: Validate new Hero system components
- **Performance Optimization**: Continuously improve test efficiency
