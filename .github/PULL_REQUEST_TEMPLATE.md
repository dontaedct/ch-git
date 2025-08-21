# Pull Request

## Summary
<!-- One-line description of the change -->

## Change Plan
<!-- Link to detailed change plan document or attach plan below -->

**Objective**: [Clear statement of what this change accomplishes]
**Scope**: [What files/components are affected]
**Risk Assessment**: [Low/Medium/High with justification]
**Testing Strategy**: [How changes will be validated]
**Rollback Plan**: [How to undo if needed]

## AI Change Compliance Checklist

<!-- ALL CHECKBOXES MUST BE CHECKED BEFORE MERGE -->

- [ ] **Change Plan**: Complete plan document attached above
- [ ] **Safety Checks**: `npm run doctor && npm run ci` both pass
- [ ] **No Forbidden Surfaces**: No scripts/CI/migrations/secrets touched
- [ ] **Registry Updates**: If touching registries, CHANGE_JOURNAL.md updated
- [ ] **Import Compliance**: Only @app/* @data/* @lib/* @ui/* @registry/* @compat/*
- [ ] **Rename Scripts**: Used npm run rename:* if applicable
- [ ] **Rollback Plan**: Documented rollback procedure above
- [ ] **Testing**: Changes tested in development environment
- [ ] **Documentation**: Updated relevant documentation
- [ ] **Security Review**: No RLS/auth weakening, no secret exposure

## Testing

### What was tested
<!-- Describe what functionality was tested -->

### How it was tested
<!-- Describe the testing approach and tools used -->

### Test results
<!-- Include test output or screenshots if applicable -->

## Impact

### Who is affected
<!-- List users, teams, or systems affected by this change -->

### What is affected
<!-- List components, APIs, or data affected by this change -->

### Breaking changes
<!-- Document any breaking changes and migration steps -->

## Rollback

### Quick rollback steps
<!-- Step-by-step procedure to revert in <5 minutes -->

### Data preservation
<!-- How to preserve user data during rollback -->

### Service impact
<!-- Expected downtime or service disruption during rollback -->

## Additional Information

### Screenshots
<!-- Add screenshots if UI changes are included -->

### Related issues
<!-- Link to related issues or discussions -->

### Dependencies
<!-- List any new dependencies or version changes -->

### Performance impact
<!-- Document any performance implications -->

## Checklist for Reviewers

- [ ] Change plan is complete and reasonable
- [ ] All compliance checkboxes are checked
- [ ] Testing approach is adequate
- [ ] Rollback plan is clear and tested
- [ ] No forbidden surfaces are modified
- [ ] Security implications are considered
- [ ] Documentation is updated
- [ ] Performance impact is acceptable

## Approval

<!-- Reviewers must check these boxes -->

- [ ] **Technical Review**: [Reviewer name] - [Date]
- [ ] **Security Review**: [Reviewer name] - [Date] (if required)
- [ ] **Final Approval**: [Reviewer name] - [Date]

---

**Note**: This PR template enforces the AI Change Policy. All checkboxes must be completed before merge. For questions about the policy, see `docs/AI_CHANGE_POLICY.md`.
