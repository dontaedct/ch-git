"use strict";
/**
 * @dct/mit-hero-core
 * MIT Hero Core Adapters
 *
 * This module provides adapter interfaces for external dependencies,
 * enabling dependency inversion, easier testing, and flexible implementations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["TRACE"] = "trace";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
//# sourceMappingURL=adapters.js.map