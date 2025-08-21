# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to security@coachhub.com. All security vulnerabilities will be promptly addressed.

Please do not create public GitHub issues for security vulnerabilities.

## Security Measures

- All API endpoints are protected with authentication
- Row Level Security (RLS) is enforced in the database
- Environment variables are properly secured and not exposed
- No secrets or API keys are committed to the repository
- Input validation is enforced on all user inputs
