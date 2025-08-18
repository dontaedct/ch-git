"use strict";
/**
 * @dct/mit-hero-core
 * MIT Hero Core Types
 *
 * This module provides the foundational types and interfaces for the MIT Hero system,
 * extracted from the main application to enable reuse across packages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerState = exports.RetryStrategy = exports.ErrorCategory = void 0;
// ============================================================================
// RETRY TYPES
// ============================================================================
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCategory["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    ErrorCategory["RATE_LIMIT_ERROR"] = "RATE_LIMIT_ERROR";
    ErrorCategory["AUTH_ERROR"] = "AUTH_ERROR";
    ErrorCategory["PERMISSION_ERROR"] = "PERMISSION_ERROR";
    ErrorCategory["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCategory["RESOURCE_UNAVAILABLE"] = "RESOURCE_UNAVAILABLE";
    ErrorCategory["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ErrorCategory["QUOTA_EXCEEDED"] = "QUOTA_EXCEEDED";
    ErrorCategory["SYSTEM_ERROR"] = "SYSTEM_ERROR";
    ErrorCategory["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    ErrorCategory["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCategory["UNKNOWN"] = "UNKNOWN";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
var RetryStrategy;
(function (RetryStrategy) {
    RetryStrategy["IMMEDIATE"] = "IMMEDIATE";
    RetryStrategy["LINEAR"] = "LINEAR";
    RetryStrategy["EXPONENTIAL"] = "EXPONENTIAL";
    RetryStrategy["CUSTOM"] = "CUSTOM";
})(RetryStrategy || (exports.RetryStrategy = RetryStrategy = {}));
var CircuitBreakerState;
(function (CircuitBreakerState) {
    CircuitBreakerState["CLOSED"] = "CLOSED";
    CircuitBreakerState["OPEN"] = "OPEN";
    CircuitBreakerState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitBreakerState || (exports.CircuitBreakerState = CircuitBreakerState = {}));
//# sourceMappingURL=types.js.map