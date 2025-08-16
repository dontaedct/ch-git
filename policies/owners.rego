package owners

import future.keywords.if
import future.keywords.in

# Default allow - only deny if explicitly blocked
default allow = true

# Block changes to sensitive paths without proper ownership
deny[msg] {
    # Check for changes in sensitive paths
    some file in input.changed_files
    is_sensitive_path(file.path)
    
    # Check if file lacks proper ownership coverage
    not has_proper_ownership(file)
    
    msg := sprintf("MISSING_OWNERSHIP: Sensitive path %v changed without proper CODEOWNERS coverage", [file.path])
}

# Define sensitive paths
is_sensitive_path(path) {
    startswith(path, "db/migrations/")
}

is_sensitive_path(path) {
    startswith(path, "app/(core)/")
}

is_sensitive_path(path) {
    startswith(path, "lib/supabase/")
}

is_sensitive_path(path) {
    startswith(path, "scripts/")
}

# Check if file has proper ownership
has_proper_ownership(file) {
    # Check if file is covered by CODEOWNERS
    some owner in input.codeowners
    owner.matches(file.path)
}

has_proper_ownership(file) {
    # Check if required reviewers are assigned
    some reviewer in input.required_reviewers
    reviewer.approved
}

has_proper_ownership(file) {
    # Check if change is by authorized user
    input.author in input.authorized_users
}

has_proper_ownership(file) {
    # Check if change is in emergency/backup mode
    input.emergency_mode == true
}

# Check if owner pattern matches file path
matches(owner, file_path) {
    # Simple pattern matching for CODEOWNERS
    startswith(file_path, owner.path)
}

matches(owner, file_path) {
    # Wildcard pattern matching
    contains(file_path, owner.pattern)
}

# Helper function to check if string contains substring
contains(str, substr) {
    startswith(str, substr)
}

contains(str, substr) {
    endswith(str, substr)
}

contains(str, substr) {
    # Check if substr appears anywhere in str
    some i
    startswith(str, substr)
}

# Provide reasons and suggested next steps
reasons = [
    "Changes to sensitive paths require proper CODEOWNERS coverage",
    "Sensitive areas need explicit ownership and review",
    "Security and stability require proper access controls"
]

suggested_fixes = [
    "Add file to CODEOWNERS with appropriate owners",
    "Request review from required reviewers",
    "Ensure change is approved by authorized users",
    "Use emergency mode only when absolutely necessary"
]

# Risk score for this policy
risk_score = 3
