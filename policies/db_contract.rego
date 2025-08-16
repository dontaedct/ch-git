package db_contract

import future.keywords.if
import future.keywords.in

# Default allow - only deny if explicitly blocked
default allow = true

# Block dangerous schema changes unless properly marked
deny[msg] {
    # Check for dangerous operations
    some change in input.changes
    is_dangerous_change(change)
    
    # Check if change is properly marked for expansion/contraction
    not is_properly_marked(change)
    
    msg := sprintf("DANGEROUS_SCHEMA_CHANGE: %v detected without proper expand-contract marking", [change.operation])
}

# Check if change is dangerous (schema contraction)
is_dangerous_change(change) {
    change.operation == "DROP"
}

is_dangerous_change(change) {
    change.operation == "RENAME"
}

is_dangerous_change(change) {
    change.operation == "ALTER_TYPE"
    change.risk_level == "tightening"
}

# Check if change is properly marked for expansion/contraction
is_properly_marked(change) {
    # Must have expand-contract label or branch name
    has_expand_contract_marker(change)
    
    # Must have proper SQL markers
    has_sql_markers(change)
}

# Check for expand-contract markers
has_expand_contract_marker(change) {
    # PR has expand-contract label
    input.pr.labels[_] == "expand-contract"
}

has_expand_contract_marker(change) {
    # Branch name contains expand-contract
    contains(input.branch, "expand-contract/")
}

# Check for SQL markers
has_sql_markers(change) {
    # Must have both #expand and #contract markers
    contains(change.sql_content, "#expand")
    contains(change.sql_content, "#contract")
    
    # Change must be in expand phase
    change.phase == "expand"
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
    "Schema contraction detected without proper expand-contract marking",
    "Dangerous operations (DROP/RENAME/TYPE-tightening) require special handling",
    "Use expand-contract workflow for safe schema evolution"
]

suggested_fixes = [
    "Add 'expand-contract' label to PR",
    "Use branch name containing 'expand-contract/'",
    "Add #expand and #contract markers to SQL files",
    "Ensure change is in expand phase"
]

# Risk score for this policy
risk_score = 4
