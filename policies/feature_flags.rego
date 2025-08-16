package feature_flags

import future.keywords.if
import future.keywords.in

# Default allow - only deny if explicitly blocked
default allow = true

# Block new/modified routes without feature flag wrappers
deny[msg] {
    # Check for new or modified pages/routes under /app
    some file in input.changed_files
    is_app_route(file)
    
    # Check if file is new or modified
    file.status == "added" || file.status == "modified"
    
    # Check if file lacks feature flag wrapper
    not has_feature_flag_wrapper(file)
    
    msg := sprintf("MISSING_FEATURE_FLAG: Route %v lacks feature flag wrapper", [file.path])
}

# Check if file is an app route
is_app_route(file) {
    startswith(file.path, "app/")
}

is_app_route(file) {
    startswith(file.path, "app/")
    endswith(file.path, ".tsx")
}

is_app_route(file) {
    startswith(file.path, "app/")
    endswith(file.path, ".ts")
}

# Check if file has feature flag wrapper
has_feature_flag_wrapper(file) {
    # Check for FeatureGate usage
    contains(file.content, "FeatureGate")
}

has_feature_flag_wrapper(file) {
    # Check for isEnabled wrapper
    contains(file.content, "isEnabled(")
}

has_feature_flag_wrapper(file) {
    # Check for feature flag wrapper patterns
    contains(file.content, "useFeatureFlag")
}

has_feature_flag_wrapper(file) {
    # Check for conditional rendering with feature flags
    contains(file.content, "featureFlag")
    contains(file.content, "enabled")
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
    "New or modified routes detected without feature flag wrappers",
    "Feature flags are required for safe deployment and rollback",
    "Routes must be wrapped with FeatureGate or isEnabled checks"
]

suggested_fixes = [
    "Wrap route with FeatureGate component",
    "Use isEnabled('flag-name') wrapper",
    "Implement conditional rendering based on feature flags",
    "Add feature flag configuration to registry"
]

# Risk score for this policy
risk_score = 1
