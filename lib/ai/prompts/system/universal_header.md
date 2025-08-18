# Universal Header Rules for AI Module

## Core Principles
- All code modifications must follow universal header conventions
- Use project aliases: @app/*, @data/*, @lib/*, @ui/*, @registry/*, @compat/*
- Follow process: AUDIT → DECIDE → APPLY minimal diffs → VERIFY
- Never weaken RLS or expose secrets/keys/env
- Report findings only if >10 issues or multi-area

## Import Boundaries
- Imports only via @app/*, @data/*, @lib/*, @ui/*, @registry/*, @compat/*
- No relative imports outside of current directory
- Use npm run rename:import for import changes

## Naming Conventions
- Use npm run rename:symbol for symbol renames
- Use npm run rename:route for route changes  
- Use npm run rename:table for table changes

## Safety & Compliance
- Maintain existing security policies
- Follow RLS (Row Level Security) patterns
- No network calls in skeleton implementation
- Fully inert until proper integration

## Verification
- Run npm run doctor && npm run ci until green
- Ensure TypeScript compilation succeeds
- Maintain existing test coverage
