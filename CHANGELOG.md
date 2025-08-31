# Changelog

## 0.3.0

### Minor Changes

- SOS Phase 6 Task 31: Release management setup

  Added changesets for automated versioning, changelog generation, git tagging, and release automation. Configured GitHub Actions workflow for releases.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Release management setup with changesets
- Automated versioning and changelog generation
- Git tagging automation for releases

## [0.2.0] - 2025-08-31

### Added

- SOS Operation Phase 5 implementation
- Background Jobs system
- Role-Based Access Control (RBAC)
- Industry-specific template presets
- Comprehensive form table CSV handling
- Email service integration
- Scheduling system
- Stripe checkout integration
- **feat(design):** scaffold OSS Hero Design Safety Module (portable)
  - Added design safety policies (ESLint, import boundaries, token guards)
  - Added performance budgets (Lighthouse CI, bundle limits)
  - Added design guardian scripts (contracts, accessibility, visual, performance)
  - Added test templates and UI test files
  - Added GitHub workflow for design safety CI/CD
  - Added npm scripts for design safety checks

### Changed

- Enhanced template system with industry presets
- Improved background job processing
- Updated RBAC implementation
- Enhanced package.json with design safety npm scripts

### Fixed

- Critical payment calculation fallback errors
- TypeScript compilation issues
- Missing @hookform/resolvers dependency
- Storybook dependency version conflicts

## [0.1.0] - 2025-08-21

### Added

- Initial project setup
- OSS Hero Design Safety Module foundation
