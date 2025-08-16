# Implementation Prompt Kit - Performance Fixes

**Date:** 2025-08-15  
**Purpose:** Copy/paste prompts for implementing performance fixes in Cursor  

## How to Use This Kit

1. **Copy the prompt** for the fix you want to implement
2. **Paste it into Cursor** and execute
3. **Follow the generated code** and apply the changes
4. **Run the verification tests** to ensure success
5. **Use the rollback instructions** if needed

---

## Prompt 1: Deadlines & Cancellation Wrapper

**Goal:** Add AbortController and timeout handling to Node child_process and fetch operations

**Touched Files:** `scripts/build-simple.js`, `scripts/guardian.js`, `scripts/hero-unified-orchestrator.js`

**Diff Plan:** Add timeout wrapper with AbortController, implement cleanup handlers

**Tests to Run:** `npm run build:fast`, `npm run guardian:health`

**Acceptance Criteria:** All long-running operations have timeout handling, no more hanging processes

**Revert Path:** Remove timeout wrapper functions, restore original spawn calls

---

**PROMPT TO COPY:**

```
You are a performance engineer working on the MIT Hero System. I need you to implement deadline and cancellation wrappers for Node.js child_process operations to prevent hanging processes.

Please examine the following files and add proper timeout handling:
- scripts/build-simple.js
- scripts/guardian.js  
- scripts/hero-unified-orchestrator.js

For each file, implement:
1. A timeout wrapper function that uses AbortController
2. Proper cleanup of child processes on timeout
3. Error handling for timeout scenarios
4. Logging of timeout events

The wrapper should:
- Accept a timeout value (default 5 minutes)
- Use AbortController for cancellation
- Kill child processes with SIGTERM, then SIGKILL if needed
- Return a promise that resolves/rejects appropriately
- Include proper error messages for debugging

Please show me the complete implementation for each file with clear before/after code examples.
```

---

## Prompt 2: Retry Helper with Jitter

**Goal:** Implement retry helper with exponential backoff and jitter for all network/model operations

**Touched Files:** `lib/retry.ts` (new), `scripts/guardian.js`, `scripts/hero-unified-orchestrator.js`

**Diff Plan:** Create retry utility, integrate with existing operations, add error taxonomy

**Tests to Run:** `npm run guardian:health`, `npm run hero:unified:status`

**Acceptance Criteria:** All operations have retry logic, consistent error handling, no silent failures

**Revert Path:** Remove retry logic, restore original error handling

---

**PROMPT TO COPY:**

```
I need you to implement a comprehensive retry helper system for the MIT Hero System with exponential backoff and jitter. This should prevent silent failures and improve system reliability.

Please create:
1. A new file lib/retry.ts with a RetryHelper class
2. Integration with existing guardian and orchestrator scripts
3. Standardized error taxonomy and handling

The RetryHelper should support:
- Exponential backoff with configurable base delay
- Jitter to prevent thundering herd problems
- Maximum retry attempts (configurable)
- Circuit breaker pattern for repeated failures
- Detailed logging of retry attempts
- Different retry strategies (immediate, exponential, custom)

For the error taxonomy, create categories:
- Network errors (retryable)
- Authentication errors (not retryable)
- Resource errors (retryable with backoff)
- System errors (not retryable)

Please show me the complete implementation including:
- The RetryHelper class
- Integration examples in guardian.js and orchestrator.js
- Error taxonomy definitions
- Usage examples and best practices
```

---

## Prompt 3: Heartbeat Emitter for Long Tasks

**Goal:** Implement heartbeat system for long-running tasks to prevent UI freezing

**Touched Files:** `lib/heartbeat.ts` (new), `scripts/doctor.ts`, `scripts/build-simple.js`

**Diff Plan:** Create heartbeat utility, integrate with long-running operations, add progress reporting

**Tests to Run:** `npm run doctor`, `npm run build:performance`

**Acceptance Criteria:** All long tasks emit heartbeats every 5-10s, UIs never appear frozen

**Revert Path:** Remove heartbeat calls, restore original progress reporting

---

**PROMPT TO COPY:**

```
I need you to implement a heartbeat system for long-running tasks in the MIT Hero System to prevent UIs from appearing frozen and provide better user experience.

Please create:
1. A new file lib/heartbeat.ts with a HeartbeatEmitter class
2. Integration with doctor.ts for TypeScript analysis
3. Integration with build scripts for build progress

The HeartbeatEmitter should:
- Emit progress updates every 5-10 seconds
- Include current operation, progress percentage, and ETA
- Support multiple concurrent operations
- Provide structured output for different UI types
- Include memory and CPU usage information
- Support cancellation and cleanup

For integration:
- Add heartbeats to doctor.ts file processing loops
- Add heartbeats to build script execution
- Ensure heartbeats work in both terminal and CI environments
- Include progress bars and status indicators

Please show me the complete implementation including:
- The HeartbeatEmitter class
- Integration examples in doctor.ts and build scripts
- Progress reporting formats
- Usage examples and configuration options
```

---

## Prompt 4: Bounded Concurrency Utility

**Goal:** Implement bounded concurrency system to prevent resource overload

**Touched Files:** `lib/concurrency.ts` (new), `scripts/mit-hero-unified-integration.js`, `scripts/hero-unified-orchestrator.js`

**Diff Plan:** Create concurrency limiter, integrate with orchestration scripts, add resource monitoring

**Tests to Run:** `npm run hero:unified:execute`, `npm run hero:unified:status`

**Acceptance Criteria:** No more than 10 concurrent operations, proper resource management

**Revert Path:** Remove concurrency limits, restore original parallel execution

---

**PROMPT TO COPY:**

```
I need you to implement a bounded concurrency system for the MIT Hero System to prevent resource overload and ensure predictable performance. The current system has unbounded concurrency which causes memory leaks and system instability.

Please create:
1. A new file lib/concurrency.ts with a ConcurrencyLimiter class
2. Integration with mit-hero-unified-integration.js
3. Integration with hero-unified-orchestrator.js

The ConcurrencyLimiter should support:
- Configurable maximum concurrent operations (default: 10)
- Queue system for pending operations
- Priority-based execution
- Resource monitoring and limits
- Graceful degradation under load
- Detailed metrics and logging

For the orchestration scripts:
- Limit concurrent health checks to 20
- Limit concurrent build operations to 3
- Limit concurrent test operations to 5
- Add resource monitoring and alerts

Please show me the complete implementation including:
- The ConcurrencyLimiter class with queue management
- Integration examples in both orchestrator scripts
- Resource monitoring and alerting
- Configuration options and best practices
- Performance impact analysis
```

---

## Prompt 5: Structured Logging with Correlation IDs

**Goal:** Replace console.log spam with structured logging and correlation IDs

**Touched Files:** `lib/logger.ts` (new), multiple script files, `next.config.ts`

**Diff Plan:** Create structured logger, replace console calls, add correlation tracking

**Tests to Run:** `npm run build:performance`, `npm run doctor:ultra-light`

**Acceptance Criteria:** No console.log in production, structured logs with correlation IDs

**Revert Path:** Restore console.log calls, remove structured logging

---

**PROMPT TO COPY:**

```
I need you to implement structured logging for the MIT Hero System to replace the console.log spam and provide better debugging and monitoring capabilities.

Please create:
1. A new file lib/logger.ts with a structured Logger class
2. Replace console.log calls in key script files
3. Add correlation ID tracking for operations
4. Configure different log levels for different environments

The Logger should support:
- Multiple log levels (debug, info, warn, error)
- Structured JSON output with metadata
- Correlation IDs for tracking operations
- Performance metrics and timing
- Environment-specific configuration
- File and console output options

For the script files, focus on:
- scripts/hero-unified-orchestrator.js
- scripts/guardian.js
- scripts/doctor.ts
- scripts/build-simple.js

Please show me the complete implementation including:
- The Logger class with all features
- Examples of replacing console.log calls
- Correlation ID implementation
- Configuration for different environments
- Performance impact and best practices
```

---

## Prompt 6: Next.js Build Hardening

**Goal:** Optimize Next.js build performance with analyzer, code-splitting, and bundle budgets

**Touched Files:** `next.config.ts`, `package.json`, `.github/workflows/ci.yml`

**Diff Plan:** Enhance webpack config, add bundle analysis, implement performance budgets

**Tests to Run:** `npm run build:performance`, `npm run build:analyze`

**Acceptance Criteria:** Build times within budgets, optimized bundle sizes, CI performance improvements

**Revert Path:** Restore original Next.js config, remove performance optimizations

---

**PROMPT TO COPY:**

```
I need you to optimize the Next.js build configuration for the MIT Hero System to improve build performance and implement performance budgets. The current build is slow and unpredictable.

Please enhance:
1. next.config.ts with advanced webpack optimizations
2. package.json with build analysis scripts
3. CI workflow with build performance monitoring

The optimizations should include:
- Advanced webpack 5 features and caching
- Bundle analysis and size monitoring
- Code splitting and lazy loading
- Performance budgets and alerts
- Build time monitoring and reporting
- Memory usage optimization

For the CI workflow:
- Add build performance tracking
- Implement build caching
- Add parallel build jobs
- Monitor build resource usage

Please show me the complete implementation including:
- Enhanced next.config.ts with all optimizations
- New npm scripts for build analysis
- CI workflow improvements
- Performance budget configuration
- Monitoring and alerting setup
```

---

## Prompt 7: Memory/CPU Profiling Scripts

**Goal:** Create npm tasks for heap snapshots and CPU profiling

**Touched Files:** `scripts/profile-memory.js` (new), `scripts/profile-cpu.js` (new), `package.json`

**Diff Plan:** Create profiling utilities, add npm scripts, integrate with existing monitoring

**Tests to Run:** `npm run profile:memory`, `npm run profile:cpu`

**Acceptance Criteria:** Easy profiling commands, heap snapshots, CPU profiles, performance analysis

**Revert Path:** Remove profiling scripts, restore original monitoring

---

**PROMPT TO COPY:**

```
I need you to create memory and CPU profiling utilities for the MIT Hero System to help diagnose performance issues and memory leaks.

Please create:
1. scripts/profile-memory.js for heap snapshots and memory analysis
2. scripts/profile-cpu.js for CPU profiling and performance analysis
3. Add corresponding npm scripts to package.json
4. Integration with existing performance monitoring

The memory profiler should:
- Generate heap snapshots at configurable intervals
- Analyze memory usage patterns
- Detect potential memory leaks
- Provide memory optimization recommendations
- Export data for external analysis

The CPU profiler should:
- Generate CPU profiles during operations
- Identify performance bottlenecks
- Measure function execution times
- Provide optimization suggestions
- Support different profiling modes

Please show me the complete implementation including:
- Both profiling scripts with full functionality
- NPM script additions to package.json
- Integration with build and test processes
- Usage examples and configuration options
- Output formats and analysis tools
```

---

## Prompt 8: CI Hardening

**Goal:** Optimize CI pipeline with caching, parallelism, and fail-fast strategies

**Touched Files:** `.github/workflows/ci.yml`, `package.json`, `scripts/ci-optimizer.js` (new)

**Diff Plan:** Enhance CI workflow, add optimization scripts, implement performance monitoring

**Tests to Run:** CI pipeline execution, local CI simulation

**Acceptance Criteria:** CI time within budgets, proper caching, parallel execution, fail-fast behavior

**Revert Path:** Restore original CI workflow, remove optimization scripts

---

**PROMPT TO COPY:**

```
I need you to optimize the CI pipeline for the MIT Hero System to improve build times, reliability, and developer experience. The current CI is slow and lacks proper optimization.

Please enhance:
1. .github/workflows/ci.yml with advanced features
2. Create scripts/ci-optimizer.js for CI optimization
3. Add CI-specific npm scripts to package.json
4. Implement performance monitoring and budgets

The CI optimizations should include:
- Build caching and dependency caching
- Parallel job execution
- Fail-fast strategies
- Resource optimization
- Performance monitoring
- Automated rollback on failures

For the workflow:
- Split jobs into parallel stages
- Add caching for node_modules and build artifacts
- Implement conditional job execution
- Add performance metrics collection
- Include rollback procedures

Please show me the complete implementation including:
- Enhanced CI workflow with all optimizations
- CI optimizer script with monitoring
- New npm scripts for CI operations
- Performance budget configuration
- Monitoring and alerting setup
```

---

## Prompt 9: PowerShell Safety Improvements

**Goal:** Make PowerShell scripts cross-platform and add proper error handling

**Touched Files:** `scripts/guardian-pm2.ps1`, `scripts/hero-ultimate.ps1`, `scripts/run-powershell.bat`

**Diff Plan:** Add error handling, cross-platform alternatives, timeout mechanisms

**Tests to Run:** PowerShell script execution, cross-platform compatibility

**Acceptance Criteria:** Reliable PowerShell execution, proper error handling, cross-platform support

**Revert Path:** Restore original PowerShell scripts, remove safety improvements

---

**PROMPT TO COPY:**

```
I need you to improve the PowerShell scripts in the MIT Hero System to make them more reliable, cross-platform compatible, and safer to execute.

Please enhance:
1. scripts/guardian-pm2.ps1 with error handling and timeouts
2. scripts/hero-ultimate.ps1 with safety improvements
3. scripts/run-powershell.bat with cross-platform support
4. Add fallback mechanisms for non-Windows systems

The improvements should include:
- Proper error handling and logging
- Timeout mechanisms for long operations
- Cross-platform compatibility checks
- Graceful degradation on unsupported systems
- Input validation and sanitization
- Proper exit code handling

For cross-platform support:
- Detect operating system
- Provide alternative implementations
- Handle execution policy issues
- Add fallback mechanisms
- Include proper error messages

Please show me the complete implementation including:
- Enhanced PowerShell scripts with all safety features
- Cross-platform compatibility layer
- Error handling and logging improvements
- Fallback mechanisms and alternatives
- Testing and validation procedures
```

---

## Prompt 10: Golden Path Smoke Tests

**Goal:** Create comprehensive smoke tests for top 10 critical scripts with performance budgets

**Touched Files:** `tests/smoke/` (new directory), `package.json`, `scripts/smoke-runner.js` (new)

**Diff Plan:** Create smoke test suite, add performance budgets, integrate with CI

**Tests to Run:** `npm run test:smoke`, `npm run test:smoke:performance`

**Acceptance Criteria:** All critical scripts pass smoke tests, performance within budgets

**Revert Path:** Remove smoke tests, restore original test configuration

---

**PROMPT TO COPY:**

```
I need you to create a comprehensive smoke test suite for the MIT Hero System to validate that all critical scripts work correctly and meet performance budgets.

Please create:
1. A new directory tests/smoke/ with smoke tests
2. scripts/smoke-runner.js for test execution
3. Add smoke test scripts to package.json
4. Performance budget validation for each test

The smoke tests should cover:
- Build system (build, build:fast, build:memory)
- Health checks (doctor, guardian, hero systems)
- Core operations (lint, typecheck, test)
- Performance monitoring (build:performance, memory:detect)
- System orchestration (hero:unified, guardian)

Each test should:
- Validate basic functionality
- Check performance within budgets
- Verify resource usage limits
- Include cleanup and teardown
- Provide detailed reporting

Please show me the complete implementation including:
- Smoke test suite for all critical scripts
- Smoke runner with performance monitoring
- NPM script additions
- Performance budget configuration
- Test reporting and analysis
```

---

## Prompt 11: SLO Enforcement

**Goal:** Create script that fails CI if performance exceeds budgets or memory limits

**Touched Files:** `scripts/slo-enforcer.js` (new), `.github/workflows/ci.yml`, `package.json`

**Diff Plan:** Create SLO enforcement script, integrate with CI, add performance gates

**Tests to Run:** SLO enforcement locally, CI integration testing

**Acceptance Criteria:** CI fails on budget violations, proper performance gates, clear error messages

**Revert Path:** Remove SLO enforcement, restore original CI workflow

---

**PROMPT TO COPY:**

```
I need you to create an SLO enforcement system for the MIT Hero System that will fail CI builds if performance budgets are exceeded or memory limits are violated.

Please create:
1. scripts/slo-enforcer.js for SLO validation
2. Integration with .github/workflows/ci.yml
3. Add SLO enforcement scripts to package.json
4. Performance gates and budget validation

The SLO enforcer should:
- Validate build time budgets (p95 < 20s, p99 < 30s)
- Check memory usage limits (max 4GB per process)
- Verify CPU usage constraints (max 80% sustained)
- Enforce CI time budgets (p95 < 8min, p99 < 12min)
- Provide detailed violation reports
- Support configurable thresholds

For CI integration:
- Add SLO checks to all CI stages
- Fail builds on budget violations
- Include performance metrics in CI output
- Support performance regression detection
- Add rollback mechanisms

Please show me the complete implementation including:
- SLO enforcer script with all validations
- CI workflow integration
- NPM script additions
- Performance gate configuration
- Error handling and reporting
```

---

## Prompt 12: Documentation Updates

**Goal:** Replace absolute marketing claims with measurable SLOs and proof points

**Touched Files:** `README.md`, `docs/`, `package.json` scripts descriptions

**Diff Plan:** Update documentation with SLOs, remove absolute claims, add performance metrics

**Tests to Run:** Documentation review, SLO validation

**Acceptance Criteria:** No absolute claims, measurable SLOs, clear performance metrics

**Revert Path:** Restore original documentation, remove SLO references

---

**PROMPT TO COPY:**

```
I need you to update the documentation for the MIT Hero System to replace absolute marketing claims with measurable SLOs and concrete performance metrics. The current documentation makes claims like "100% uptime" and "bulletproof reliability" which are not credible.

Please update:
1. README.md with measurable SLOs
2. Package.json script descriptions with performance budgets
3. Documentation files with concrete metrics
4. Remove all absolute claims and replace with credible targets

The updates should include:
- Replace "100% uptime" with "99.9% availability target"
- Replace "bulletproof reliability" with "<0.1% error rate target"
- Replace "one seamless machine" with "99.5% system uptime target"
- Add performance budgets and SLOs
- Include measurement methods and tools
- Provide baseline performance data

For the package.json scripts:
- Update descriptions with performance expectations
- Add budget information where relevant
- Include SLO references for critical operations
- Provide performance guidance for users

Please show me the complete implementation including:
- Updated README.md with SLOs and metrics
- Enhanced package.json script descriptions
- Documentation updates with performance data
- SLO definitions and measurement methods
- Performance guidance and best practices
```

---

## Implementation Sequence

### Week 1: Critical Fixes
1. **Prompt 1:** Deadlines & Cancellation Wrapper
2. **Prompt 2:** Retry Helper with Jitter
3. **Prompt 3:** Heartbeat Emitter for Long Tasks

### Week 2: Performance Hardening
4. **Prompt 4:** Bounded Concurrency Utility
5. **Prompt 5:** Structured Logging with Correlation IDs
6. **Prompt 6:** Next.js Build Hardening

### Week 3: CI & Reliability
7. **Prompt 7:** Memory/CPU Profiling Scripts
8. **Prompt 8:** CI Hardening
9. **Prompt 9:** PowerShell Safety Improvements

### Week 4: Testing & Validation
10. **Prompt 10:** Golden Path Smoke Tests
11. **Prompt 11:** SLO Enforcement
12. **Prompt 12:** Documentation Updates

## Success Verification

After implementing each fix:

1. **Run the specified tests** to verify functionality
2. **Check performance metrics** against budgets
3. **Verify no regressions** in existing functionality
4. **Document the changes** and update runbooks
5. **Test rollback procedures** to ensure safety

## Rollback Strategy

Each prompt includes specific rollback instructions. In general:

1. **Git revert** the specific changes
2. **Restore original files** from backup
3. **Remove new dependencies** if added
4. **Verify system functionality** after rollback
5. **Document the rollback** for future reference

---

**Note:** These prompts are designed to be executed sequentially to build a robust, performant system. Each builds on the previous fixes to create a comprehensive performance optimization.
