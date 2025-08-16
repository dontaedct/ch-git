package risk_score

import future.keywords.if
import future.keywords.in

# Default allow - only deny if explicitly blocked
default allow = true

# Compute additive risk score
risk_score = total_risk_score

# Calculate total risk score from all factors
total_risk_score = sum([
    schema_contraction_risk,
    env_change_risk,
    major_dep_bump_risk,
    cross_module_change_risk,
    new_route_risk
])

# Schema contraction risk (+4)
schema_contraction_risk = 4 {
    some change in input.changes
    is_schema_contraction(change)
}

default schema_contraction_risk = 0

# Environment change risk (+3)
env_change_risk = 3 {
    some file in input.changed_files
    is_env_file(file)
}

default env_change_risk = 0

# Major dependency bump risk (+3)
major_dep_bump_risk = 3 {
    some dep in input.dependency_changes
    is_major_bump(dep)
}

default major_dep_bump_risk = 0

# Cross-module change risk (+2)
cross_module_change_risk = 2 {
    some file in input.changed_files
    is_cross_module_change(file)
}

default cross_module_change_risk = 0

# New route risk (+1)
new_route_risk = 1 {
    some file in input.changed_files
    is_new_route(file)
}

default new_route_risk = 0

# Check if change is schema contraction
is_schema_contraction(change) {
    change.operation == "DROP"
}

is_schema_contraction(change) {
    change.operation == "RENAME"
}

is_schema_contraction(change) {
    change.operation == "ALTER_TYPE"
    change.risk_level == "tightening"
}

# Check if file is environment-related
is_env_file(file) {
    file.path == ".env"
}

is_env_file(file) {
    file.path == ".env.local"
}

is_env_file(file) {
    file.path == ".env.production"
}

is_env_file(file) {
    file.path == "lib/env.ts"
}

# Check if dependency change is major bump
is_major_bump(dep) {
    dep.change_type == "major"
}

is_major_bump(dep) {
    dep.old_version != dep.new_version
    startswith(dep.new_version, "2.")
    startswith(dep.old_version, "1.")
}

# Check if change affects multiple modules
is_cross_module_change(file) {
    # Check if file imports from multiple modules
    count(file.imports) > 3
}

is_cross_module_change(file) {
    # Check if file is in shared/common directory
    startswith(file.path, "lib/")
    not startswith(file.path, "lib/supabase/")
}

# Check if file is a new route
is_new_route(file) {
    file.status == "added"
    startswith(file.path, "app/")
    endswith(file.path, ".tsx")
}

# Risk level classification
risk_level = "LOW" {
    total_risk_score < 3
}

risk_level = "MEDIUM" {
    total_risk_score >= 3
    total_risk_score < 7
}

risk_level = "HIGH" {
    total_risk_score >= 7
    total_risk_score < 10
}

risk_level = "CRITICAL" {
    total_risk_score >= 10
}

# Provide risk assessment details
risk_assessment = {
    "score": total_risk_score,
    "level": risk_level,
    "factors": {
        "schema_contraction": schema_contraction_risk,
        "env_change": env_change_risk,
        "major_dep_bump": major_dep_bump_risk,
        "cross_module_change": cross_module_change_risk,
        "new_route": new_route_risk
    },
    "recommendations": risk_recommendations
}

# Risk-based recommendations
risk_recommendations = ["Review changes carefully"] {
    total_risk_score >= 5
}

risk_recommendations = [
    "Require additional review",
    "Consider staging deployment",
    "Monitor closely after deployment"
] {
    total_risk_score >= 7
}

risk_recommendations = [
    "Require senior developer review",
    "Consider rollback plan",
    "Deploy during maintenance window"
] {
    total_risk_score >= 10
}

default risk_recommendations = ["Standard review process"]
