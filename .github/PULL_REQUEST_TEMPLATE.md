# Pull Request

## Description
Brief description of the changes in this PR.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Database schema change
- [ ] Performance improvement
- [ ] Security enhancement

## Database Changes Checklist
**⚠️ REQUIRED for any database schema changes**

- [ ] DB changes follow expand→dual-read/write→contract workflow
- [ ] Plan ID: `<enter_plan_id_here>`
- [ ] Phase: `<expand|contract|dual-read-write>`
- [ ] Migration artifacts uploaded and linked below
- [ ] Shadow migration test passed ✅

### Migration Plan Details
**Plan ID**: `<enter_plan_id_here>`
**Current Phase**: `<expand|contract|dual-read-write>`
**Description**: Brief description of the migration plan

**Migration Files**:
- `supabase/migrations/<filename>.sql` - `<description>`

**Phase Markers**:
- [ ] `#expand` - Additive changes only
- [ ] `#dual-read-write` - Both old and new schemas supported
- [ ] `#contract` - Removal of deprecated elements

**Rollback Plan**: Describe how to rollback if issues occur

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Shadow database migration test passed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is documented
- [ ] No console.log statements left in code
- [ ] No hardcoded secrets or API keys
- [ ] Database migrations are safe and tested
- [ ] All linting checks pass
- [ ] TypeScript compilation successful

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information that reviewers should know.

## Related Issues
Closes #<issue_number>
Related to #<issue_number>

## Migration Safety Report
If this PR contains database changes, the migration safety report will be available as a GitHub Actions artifact after the workflow completes.
