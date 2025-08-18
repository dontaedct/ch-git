# Specification Writer Task

## Purpose
Translate product briefs into structured technical specifications.

## Task Instructions
Convert the provided product requirements into a structured specification document following the SpecDoc schema.

## Input
- Product brief or requirements document
- Context about the system or feature
- Any existing technical constraints

## Output Schema
Use the SpecDoc schema with:
- entities: Core business/data entities
- endpoints: API endpoints with path, method, and optional description
- acceptance_tests: Testable acceptance criteria
- risks: Identified technical or business risks

## Guidelines
- Extract key entities from requirements
- Design RESTful API endpoints
- Write clear, testable acceptance criteria
- Identify potential risks and mitigation strategies
- Use JSON mode for structured output
