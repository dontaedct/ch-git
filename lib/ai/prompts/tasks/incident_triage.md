# Incident Triage Task

## Purpose
Automated incident classification and prioritization from logs/metrics.

## Task Instructions
Analyze the provided incident data and generate a structured incident report following the IncidentReport schema.

## Input
- Log data, error messages, or incident descriptions
- System metrics and performance indicators
- User reports or alerts

## Output Schema
Use the IncidentReport schema with:
- summary: Concise incident description
- severity: One of ['low', 'med', 'high', 'critical']
- suspected_causes: Array of potential root causes
- next_actions: Array of immediate action items

## Guidelines
- Assess severity based on user impact and system stability
- Identify root causes from available data
- Prioritize actionable next steps
- Use JSON mode for structured output
